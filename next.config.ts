/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    webpack: (config: any, { isServer }: {isServer: any}) => {
        // Handle node modules that need to be ignored in the browser
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
            };
        }

        return config;
    },
    // Only use export for production builds
    ...(process.env.NODE_ENV === 'production' && {
        output: 'export',
        distDir: 'next-output',
        trailingSlash: true,
    }),
};

module.exports = nextConfig;