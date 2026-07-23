import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/preview/[slug]': [
      './data/prototypes/**/*',
      './data/prototypes-anonymized/**/*',
    ],
    '/api/showcase-image': ['./data/prototypes/**/*'],
    '/api/preview-image': ['./data/prototypes/**/*'],
  },
};

export default nextConfig;
