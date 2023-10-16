await import("./src/env.mjs");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.discordapp.com"],
  },
};

export default config;
