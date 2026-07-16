import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/checkout",
        "/cart",
        "/login",
        "/register",
        "/search",
        "/favorites",
        "/policy",
        "/reviews",
      ],
    },
    sitemap: "https://mebel-omega.ru/sitemap.xml",
  };
}
