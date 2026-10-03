import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@fishkal/design-system',
    '@fishkal/game-core',
    '@fishkal/game-renderer',
    '@fishkal/config',
    '@fishkal/shared',
    '@fishkal/api-client',
  ],
  webpack: (config) => {
    // Workspace sources use ESM-correct `.js` import suffixes (required by
    // NodeNext tsc builds); map them back to TS sources for webpack.
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.ts', '.jsx'],
    };
    return config;
  },
};

export default nextConfig;
