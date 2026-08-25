import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account/", "/editor/", "/projects", "/projects/", "/admin", "/admin/"],
      },
    ],
    sitemap: "https://snapframe.store/sitemap.xml",
  };
}
