/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // eslint: {
    //     ignoreDuringBuilds: true,
    // },
};

const imageConfig = {
    images: {
        domains: [
            "cipher-media-files.s3.amazonaws.com",
            "blog.api.cagtu.io",
            "thispersondoesnotexist.com",
            "picsum.photos",
            "openweathermap.org",
            "homaale.s3.amazonaws.com",
            "images.unsplash.com",
            "api.homaale.com",
            "192.168.0.192",
            "127.0.0.1"
        ],
    },
};

module.exports = {
    ...nextConfig,
    ...imageConfig,
    // experimental: {
    //     optimizeFonts: true,
    // },
};

// "test.cipher.api.cagtu.io",
//             "sandbox.cipher.api.cagtu.io",
//             "cipher-media-files.s3.amazonaws.com",
//             "blog.api.cagtu.io",
//             "thispersondoesnotexist.com",
//             "picsum.photos",
//             "172.16.16.70",
//             "54.252.73.240",
//             "172.16.16.96",
//             "172.16.16.48",
//             "172.16.16.88",
//             "172.16.16.43",
//             "172.16.16.46",
//             "172.16.16.43",
//             "172.16.16.200",
//             "172.16.16.123",
//             "openweathermap.org",
//             "cipher-media-files.s3.amazonaws.com",
//             "images.unsplash.com",
