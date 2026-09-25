import { loadEnvConfig } from '@next/env';
import path from 'path';
import type { NextConfig } from "next";

const projectDir = path.join(process.cwd(), '..');
loadEnvConfig(projectDir);

const nextConfig: NextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
