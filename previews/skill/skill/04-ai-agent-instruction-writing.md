# Skill: AI Agent Instruction Writing

**Source:** Agent.md (Hermes CLI Model Picker)

## Core Techniques

### 1. Context-First Approach
- Provide full system architecture upfront
- Agent shouldn't need to rediscover existing code
- Include file paths, function names, data structures

### 2. Failure-Mode Preemption
- Explicitly warn about common pitfalls
- Example: "If you don't clear it, my picker will keep showing the old list"
- Block shortcut paths that lead to incorrect results

### 3. Verification Instructions
- Specify exact verification function to use
- Explain which NOT to use (and why)
- Use the real user/system verification path, not shortcuts

### 4. "Fail Loudly" Directive
- Agent must assert specific outcomes
- Never silently report success
- Verify byte-identical output or assert failure

### 5. Schema Validation Details
- Specify exact data types (`"version" is integer 1, not string "1"`)
- Include edge cases and boundary conditions
- Provide example of correct vs incorrect output

### 6. Step-by-Step Numbered Procedure
- Clear dependencies between steps
- Each step has explicit success criteria
- Rollback instructions for failed steps

## Application to Our Game
- Write agent prompts for AI game asset pipelines
- Design modding system architecture (manifest overlay, cache, allowlist)
- Implement configuration management with cache/TTL/verification
- Build automated testing agents with "fail loudly" patterns
