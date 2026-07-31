export const siteConfig = {
  name: "Travelling with Manisha",
  description:
    "Browse curated homestays and tour packages, view itineraries on an interactive map, and book in INR or international currencies.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/images/og-default.jpg",
  links: {
    // Fill in once real accounts exist — kept empty rather than fake
    // placeholder URLs so nothing accidentally ships pointing at
    // example.com.
    instagram: "",
    facebook: "",
  },
  supportEmail: "support@example.com",
} as const;

export type SiteConfig = typeof siteConfig;
