const siteUrl = "https://peterargany.com";

const publicRoutes = [
  { path: "", changeFrequency: "monthly", priority: 1, lastModified: "2026-08-21" },
  { path: "/about", changeFrequency: "yearly", priority: 0.7, lastModified: "2026-08-21" },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5, lastModified: "2026-08-21" },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4, lastModified: "2026-08-21" },
  { path: "/menu", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-08-21" },
  { path: "/when-was-it", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-08-21" },
  { path: "/fantasy-football", changeFrequency: "weekly", priority: 0.8, lastModified: "2026-08-21" },
  { path: "/gender-reveal", changeFrequency: "yearly", priority: 0.6, lastModified: "2026-08-21" },
  { path: "/character-select", changeFrequency: "yearly", priority: 0.6, lastModified: "2026-08-21" },
  { path: "/sacko-tracker", changeFrequency: "monthly", priority: 0.4, lastModified: "2026-08-21" },
];

export default function sitemap() {
  return publicRoutes.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
    lastModified,
  }));
}
