/** Debug probe: DIVER strategy (straight down), event trace. */
import { FishkalEngine } from '../src/engine';
import { DEFAULT_LOADOUT } from '../src/state';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';

const engine = new FishkalEngine({
  config: DEFAULT_GAME_CONFIG,
  seed: 4,
  loadout: { ...DEFAULT_LOADOUT },
  onEvent: (e) => console.log(`${(e.atMs / 1000).toFixed(1)}s ${e.kind}`, e.data ?? ''),
});

engine.start();
const dt = 1 / 60;
let t = 0;
let lastLog = 0;
while (t < 120 && engine.getState() === 'PLAYING') {
  engine.setInput(0);
  if (engine.getHook().hookedFishId) engine.reel();
  else engine.stopReel();
  engine.update(dt);
  t += dt;
  if (t - lastLog > 4) {
    lastLog = t;
    const hook = engine.getHook();
    console.log(`  [t=${t.toFixed(0)}s ${hook.state} d=${hook.depth.toFixed(0)}m ten=${(hook.tensionRatio * 100).toFixed(0)}% n=${engine.getFish().length} hooked=${hook.hookedFishId}]`);
  }
}
const s = engine.getStats();
console.log(`END: ${engine.getState()} dur=${(s.elapsedMs / 1000).toFixed(1)}s catches=${s.catches} score=${s.score} maxDepth=${s.maxDepth.toFixed(0)}m`);
