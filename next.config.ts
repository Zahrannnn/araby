import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['html2canvas', 'react-pdf'],
  // Additional config for PDF generation
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;  
  },
  images: {
    remotePatterns: [
      {
        hostname: 'i.postimg.cc',
        protocol: 'https',
      },
      {
        hostname: 'crmproject.runasp.net',
        protocol: 'https',
      },
      {
        hostname: 'nedx.premiumasp.net',
        protocol: 'https',
      }
    ],
  },
};

export default withNextIntl(nextConfig);
