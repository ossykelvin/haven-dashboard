import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  agentRules: false,
  turbopack: {
    root: process.cwd()
  }
}

export default nextConfig
