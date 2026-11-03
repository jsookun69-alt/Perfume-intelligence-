/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["three"],
  experimental: { optimizePackageImports: ["@react-three/drei"] },
};
export default nextConfig;
