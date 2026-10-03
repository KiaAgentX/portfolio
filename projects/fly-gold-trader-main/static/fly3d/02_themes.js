/* Fly3D module 02/25 — color themes */
(function () {
  Fly3D.themes = [
    { name: 'GOLD',  bg: 0x0a0e17, neon: 0xffd700, bull: 0x3fb950,
      bear: 0xf85149, body: 0x8a6d1a, wing: 0x9fd8ff, neuron: 0xffd700 },
    { name: 'TEAL',  bg: 0x04141a, neon: 0x2dd4bf, bull: 0x34d399,
      bear: 0xfb7185, body: 0x155e63, wing: 0xa5f3fc, neuron: 0x5eead4 },
    { name: 'MATRIX', bg: 0x020a02, neon: 0x22c55e, bull: 0x4ade80,
      bear: 0xef4444, body: 0x14532d, wing: 0x86efac, neuron: 0x22c55e },
  ];
  Fly3D.theme = () => Fly3D.themes[Fly3D.state.theme % Fly3D.themes.length];
  Fly3D.modules.push({ name: 'themes', init() {}, update() {} });
})();
