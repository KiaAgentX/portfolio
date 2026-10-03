/**
 * Database seed: fish catalog + default game config (spec §44 architecture:
 * ADMIN → API → DATABASE → GAME CONFIG → GAME).
 */
import { prisma } from './client.js';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import type { Prisma } from '@prisma/client';

export async function seed(): Promise<void> {
  const cfg = DEFAULT_GAME_CONFIG;

  for (const f of cfg.fish) {
    const { id, ...data } = f;
    await prisma.fishSpecies.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  const cfgJson = cfg as unknown as Prisma.InputJsonValue;
  await prisma.gameConfigEntry.upsert({
    where: { key: 'game_config' },
    update: { valueJson: cfgJson },
    create: { key: 'game_config', valueJson: cfgJson },
  });

  console.log(
    `Seeded ${cfg.fish.length} fish species + game_config (${cfg.depthZones.length} depth zones).`,
  );
}

if (require.main === module) {
  seed()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
