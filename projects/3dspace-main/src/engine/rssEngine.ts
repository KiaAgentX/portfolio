// File: src/engine/rssEngine.ts

import Parser from 'rss-parser/dist/rss-parser.js';
import { eventBus } from './eventBus';
import { useMindDataStore } from '../store/mindDataStore';

// We'll use a standard rss-parser
const parser = new Parser();

// LocalStorage Keys
const FEEDS_KEY = 'mindcloud_rss_feeds_urls';
const FEEDS_LAST_MODIFIED_KEY_PREFIX = 'mindcloud_rss_lm_';
const SEEN_ITEMS_KEY = 'mindcloud_rss_seen_items';

// Helper to sanitize text fields (remove HTML tags and unescape common XML entities)
export function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  // Unescape XML/HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return cleaned.trim();
}

// Validate that content looks like valid XML/RSS
export function validateXML(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.startsWith('<')) return false;
  // Check for common feed structures
  return (
    trimmed.includes('<rss') ||
    trimmed.includes('<feed') ||
    trimmed.includes('<channel') ||
    trimmed.includes('<xml')
  );
}

// Helper to convert HSL to Hex color strings safely
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate an elegant, highly visible categorized color based on the RSS feed's source domain
export function getDomainColor(url: string | undefined): string {
  if (!url) return '#FFFFFF';
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    
    // High contrast polished presets for common/popular feed domains
    const presetColors: Record<string, string> = {
      'hnrss.org': '#FF6600',       // Hacker News Vibrant Orange
      'theverge.com': '#E5127F',     // Verge Shocking Pink
      'techcrunch.com': '#02B875',   // TechCrunch Emerald Green
      'feedburner.com': '#FF5722',   // FeedBurner Neon Coral
      'github.com': '#8B5CF6',       // GitHub Royal Violet
      'reddit.com': '#FF4500',       // Reddit Deep Orange
      'nytimes.com': '#FBBF24',      // NYT Amber Yellow
      'bbc.co.uk': '#EF4444',        // BBC Red
      'wired.com': '#3B82F6',        // Wired Cyber Blue
    };

    if (presetColors[domain]) {
      return presetColors[domain];
    }

    // Dynamic hash generation to assign unique, aesthetically consistent pastel/neon colors to other domains
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Compute HSL values to guarantee the colors are vivid and work with dark cosmic background
    const h = Math.abs(hash) % 360;
    const s = 85 + (Math.abs(hash) % 15); // Vibrant saturation: 85% - 100%
    const l = 55 + (Math.abs(hash) % 10); // Luminous lightness: 55% - 65%
    
    return hslToHex(h, s, l);
  } catch (e) {
    return '#E2E8F0'; // Slate 200 light fallback
  }
}


// Fetch a single feed with CORS proxy and retry fallback
async function fetchFeedWithRetry(url: string, attempts = 3, delayMs = 1000): Promise<{ text: string; lastModified: string | null; notModified: boolean }> {
  const lastModified = localStorage.getItem(`${FEEDS_LAST_MODIFIED_KEY_PREFIX}${url}`);
  
  for (let i = 0; i < attempts; i++) {
    try {
      const headers: Record<string, string> = {};
      if (lastModified) {
        headers['If-Modified-Since'] = lastModified;
      }

      // We call our server proxy to avoid CORS problems
      const response = await fetch(`/api/rss/fetch?url=${encodeURIComponent(url)}`, {
        headers,
      });

      if (response.status === 304) {
        return { text: '', lastModified, notModified: true };
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // The server will return { status, headers: { 'last-modified': ... }, body }
      if (data.status === 304) {
        return { text: '', lastModified, notModified: true };
      }

      const responseText = data.body || '';
      if (!validateXML(responseText)) {
        throw new Error('Invalid XML structure received from feed');
      }

      const nextLastModified = data.headers?.['last-modified'] || data.headers?.['Last-Modified'] || null;

      return {
        text: responseText,
        lastModified: nextLastModified,
        notModified: false,
      };
    } catch (error) {
      if (i === attempts - 1) {
        throw error; // Last attempt failed, propagate error
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
    }
  }
  throw new Error('Failed to fetch feed after multiple attempts');
}

// Global functions for the feeds
export function getSavedFeeds(): string[] {
  try {
    const saved = localStorage.getItem(FEEDS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing feeds list', e);
  }
  // Default fallback feeds
  return [
    'https://hnrss.org/frontpage',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.feedburner.com/TechCrunch/'
  ];
}

export function saveFeeds(feeds: string[]) {
  localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds));
}

export function getSeenItems(): string[] {
  try {
    const seen = localStorage.getItem(SEEN_ITEMS_KEY);
    return seen ? JSON.parse(seen) : [];
  } catch (e) {
    return [];
  }
}

export function addSeenItem(id: string) {
  const seen = getSeenItems();
  if (!seen.includes(id)) {
    seen.push(id);
    localStorage.setItem(SEEN_ITEMS_KEY, JSON.stringify(seen.slice(-500))); // Keep last 500 items
  }
}

export async function fetchAllFeeds() {
  const feeds = getSavedFeeds();
  const seenItems = new Set(getSeenItems());
  const store = useMindDataStore.getState();

  eventBus.emit('debug-log', {
    message: `Starting fetch for ${feeds.length} feeds...`,
    type: 'Debug',
    timestamp: new Date().toISOString()
  });

  const promises = feeds.map(async (url) => {
    try {
      const result = await fetchFeedWithRetry(url);

      if (result.notModified) {
        eventBus.emit('debug-log', {
          message: `Feed unchanged (304): ${url}`,
          type: 'Debug',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Parse XML response
      const parsedFeed = await parser.parseString(result.text);
      
      // If we got a new Last-Modified header, store it
      if (result.lastModified) {
        localStorage.setItem(`${FEEDS_LAST_MODIFIED_KEY_PREFIX}${url}`, result.lastModified);
      }

      let newCount = 0;
      const title = sanitizeText(parsedFeed.title || 'Untitled Feed');

      parsedFeed.items?.forEach((item) => {
        const itemGuid = item.guid || item.link || item.title || '';
        if (!itemGuid) return;

        if (!seenItems.has(itemGuid)) {
          newCount++;
          addSeenItem(itemGuid);

          // Build item details
          const sanitizedTitle = sanitizeText(item.title || 'Untitled Item');
          const sanitizedSnippet = sanitizeText(item.contentSnippet || item.content || '');
          const domainColor = getDomainColor(url);

          // Add a new node in our Mind Cloud with domain-specific color coding
          const node = store.addNode('Debug', domainColor, {
            label: `[Feed: ${title}] ${sanitizedTitle}`,
            details: sanitizedSnippet,
            link: item.link
          });

          // Log event
          eventBus.emit('debug-log', {
            message: `New item from ${title}: "${sanitizedTitle}"`,
            type: 'Debug',
            timestamp: new Date().toISOString(),
            nodeId: node.id
          });
        }
      });

      if (newCount > 0) {
        eventBus.emit('debug-log', {
          message: `Added ${newCount} new items from feed: ${title}`,
          type: 'Debug',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      eventBus.emit('debug-log', {
        message: `Error loading feed ${url}: ${err.message || err}`,
        type: 'SL',
        timestamp: new Date().toISOString()
      });
    }
  });

  await Promise.all(promises);
}

export function addFeed(url: string) {
  const feeds = getSavedFeeds();
  if (!feeds.includes(url)) {
    feeds.push(url);
    saveFeeds(feeds);
    
    // Trigger build node particle burst event
    eventBus.emit('debug-log', {
      message: `Added new feed subscription: ${url}`,
      type: 'Debug',
      timestamp: new Date().toISOString()
    });
    
    // Create a particle burst node with domain-specific color coding
    const store = useMindDataStore.getState();
    const domainColor = getDomainColor(url);
    store.addNode('Debug', domainColor, {
      label: `Subscribed to feed: ${url}`,
      details: 'A new network feed node has been added to the system.'
    });

    eventBus.emit('build-new-node', { type: 'Debug', color: domainColor });
    fetchAllFeeds();
  }
}

export function removeFeed(url: string) {
  const feeds = getSavedFeeds();
  const filtered = feeds.filter(f => f !== url);
  saveFeeds(filtered);
  localStorage.removeItem(`${FEEDS_LAST_MODIFIED_KEY_PREFIX}${url}`);

  eventBus.emit('debug-log', {
    message: `Removed feed subscription: ${url}`,
    type: 'Debug',
    timestamp: new Date().toISOString()
  });
}
