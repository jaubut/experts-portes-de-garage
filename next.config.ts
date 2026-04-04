import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["googleapis", "google-auth-library", "@anthropic-ai/sdk"],
};

export default nextConfig;
