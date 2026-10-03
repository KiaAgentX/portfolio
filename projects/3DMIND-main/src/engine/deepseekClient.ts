// File: src/engine/deepseekClient.ts

import { eventBus } from './eventBus';
import { useMindDataStore } from '../store/mindDataStore';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  total: number;
}

export const usageStats: UsageStats = {
  promptTokens: 0,
  completionTokens: 0,
  total: 0
};

// Simple English & Multilingual token approximation (approx. 4 characters per token)
export function calculateTokens(text: string): number {
  if (!text) return 0;
  // If mostly non-English (e.g., CJK characters), count each character as ~1-2 tokens
  let tokens = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 255) {
      // Non-ASCII character (likely Chinese, Japanese, Korean, or emoji/accent)
      tokens += 0.8; // higher weight for non-English
    } else {
      tokens += 0.25; // ~4 chars per token
    }
  }
  return Math.max(1, Math.round(tokens));
}

export async function sendMessage(
  messages: Message[],
  onTokenUpdate: (text: string, currentTokens: number) => void,
  options?: {
    apiKey?: string;
    model?: string;
    tokenLimit?: number;
  }
): Promise<string> {
  const model = options?.model || 'deepseek-v4-flash';
  const tokenLimit = options?.tokenLimit || 4000;
  const apiKey = options?.apiKey || '';

  // Calculate prompt tokens
  const promptText = messages.map(m => m.content).join('\n');
  const promptTokens = calculateTokens(promptText);
  usageStats.promptTokens += promptTokens;
  usageStats.total += promptTokens;

  // Let store know we created/updated a user node
  const store = useMindDataStore.getState();

  // Find or create chat nodes in Mind Cloud
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const userNode = store.addNode('Chat', '#0088FF', {
    label: `User: ${lastUserMessage.slice(0, 40)}${lastUserMessage.length > 40 ? '...' : ''}`,
    details: lastUserMessage
  });

  eventBus.emit('chat-message', { role: 'user', content: lastUserMessage, nodeId: userNode.id });

  // Expose initial status
  eventBus.emit('debug-log', {
    message: `Sending prompt (${promptTokens} tokens) to ${model}...`,
    type: 'Chat',
    timestamp: new Date().toISOString()
  });

  let fullResponseText = '';
  let completionTokens = 0;
  
  // Create response node for assistant in the Mind Map
  const assistantNode = store.addNode('Chat', '#0088FF', {
    label: 'Assistant is typing...',
    details: ''
  });

  // Pulse effect event for chat message
  eventBus.emit('build-new-node', { type: 'Chat', color: '#0088FF' });

  try {
    const response = await fetch('/api/chat/deepseek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey, // Pass the key. If empty, server-side uses process.env.DEEPSEEK_API_KEY or Gemini fallback
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response stream reader not available');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Save last line fragment back to buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;

        if (cleaned === 'data: [DONE]') {
          break;
        }

        if (cleaned.startsWith('data:')) {
          const jsonStr = cleaned.slice(5).trim();
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullResponseText += delta;
              completionTokens = calculateTokens(fullResponseText);
              
              const currentTotal = promptTokens + completionTokens;
              usageStats.completionTokens += 1; // Accumulate as we process
              usageStats.total += 1;

              // Update assistant node label/details dynamically
              store.updateNode(assistantNode.id, {
                label: `Assistant: ${fullResponseText.slice(0, 45)}${fullResponseText.length > 45 ? '...' : ''}`,
                details: fullResponseText
              });

              // Fire events
              onTokenUpdate(fullResponseText, currentTotal);
              eventBus.emit('token-update', { tokens: currentTotal, type: 'tp', text: fullResponseText });

              // Emit pulse event for token processing (brief pulse on green "TP" node)
              eventBus.emit('tp-pulse', { nodeId: assistantNode.id });

              // Check if limit is approached
              if (currentTotal >= tokenLimit) {
                eventBus.emit('debug-log', {
                  message: `Warning: Token limit (${tokenLimit}) reached or exceeded at ${currentTotal} total tokens!`,
                  type: 'SL',
                  timestamp: new Date().toISOString()
                });
                
                // Spawn SL (StopLimit) red node
                const slNode = store.addNode('SL', '#FF0000', {
                  label: `Limit Exceeded! ${currentTotal}/${tokenLimit}`,
                  details: `Model generation stopped early to prevent resource overrun.`
                });

                eventBus.emit('sl-limit', { nodeId: slNode.id });
                reader.cancel();
                break;
              }
            }
          } catch (e) {
            // Ignore incomplete chunks or non-JSON parts
          }
        }
      }
    }

    // Wrap up streaming
    eventBus.emit('chat-message', { role: 'assistant', content: fullResponseText, nodeId: assistantNode.id });
    
    // Add a final TP node reflecting the token consumption
    const finalTokens = promptTokens + completionTokens;
    const tpNode = store.addNode('TP', '#00FF00', {
      label: `Tokens Used: ${finalTokens} (P: ${promptTokens} | C: ${completionTokens})`,
      details: `Prompt Tokens: ${promptTokens}\nCompletion Tokens: ${completionTokens}\nTotal Processed: ${finalTokens}\nModel: ${model}`
    });

    eventBus.emit('debug-log', {
      message: `Chat response completed. Total tokens consumed: ${finalTokens}`,
      type: 'TP',
      timestamp: new Date().toISOString(),
      nodeId: tpNode.id
    });

    // Make connections between user node, assistant node and the final token node
    store.addConnection(userNode.id, assistantNode.id);
    store.addConnection(assistantNode.id, tpNode.id);

    return fullResponseText;
  } catch (error: any) {
    eventBus.emit('debug-log', {
      message: `Stream request failed: ${error.message || error}`,
      type: 'SL',
      timestamp: new Date().toISOString()
    });

    store.updateNode(assistantNode.id, {
      label: 'Error: Connection lost.',
      details: `An error occurred while generating a response:\n${error.message || error}`
    });

    throw error;
  }
}
