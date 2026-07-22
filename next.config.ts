import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // prompts/ is read with fs at runtime — keep it in the serverless bundle
  outputFileTracingIncludes: { "/api/**": ["./prompts/**"] },
};

export default nextConfig;
