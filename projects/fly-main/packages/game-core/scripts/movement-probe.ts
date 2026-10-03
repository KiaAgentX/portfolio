/** Movement probe: does HOOK_MOVE_SPEED actually change hook.x? */
import { FishkalEngine } from '../src/engine';
import { DEFAULT_LOADOUT } from '../src/state';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';

const e = new FishkalEngine({ config: DEFAULT_GAME_CONFIG, loadout: { ...DEFAULT_LOADOUT } });
e.start();
const dt = 1 / 60;
for (let i = 0; i < 60; i++) { e.setInput(1); e.update(dt); }
console.log('hook.x after 1s full-right input:', e.getHook().x.toFixed(2), '(expect ~29.3, clamped to 12)');
console.log('hook.state:', e.getHook().state, 'depth:', e.getHook().depth.toFixed(1));
