import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Désactivé : le code des pages est écrit sans <Suspense> autour des données dynamiques
  cacheComponents: false,
  partialPrefetching: false, // nécessite cacheComponents
  // Autorise <Image> à afficher la photo de profil Google
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Autorise <Image> à afficher les photos des annonces hébergées sur Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
