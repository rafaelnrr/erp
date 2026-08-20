/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint não bloqueia o build — rode 'next lint' separadamente para checar
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros de tipo durante o build de produção
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
