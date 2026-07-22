import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/preview/[slug]': [
      './data/prototypes/**/*',
      './data/prototypes-anonymized/**/*',
    ],
  },
};

export default nextConfig;
