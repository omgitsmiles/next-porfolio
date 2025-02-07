/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.nba.com'
            }
        ]
    },
    experimental: {
        serverActions: true,
    },
}

module.exports = nextConfig
