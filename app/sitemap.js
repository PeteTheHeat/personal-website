const siteUrl = "https://peterargany.com";

const publicRoutes = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/when-was-it", changeFrequency: "monthly", priority: 0.8 },
  { path: "/fantasy-football", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gender-reveal", changeFrequency: "yearly", priority: 0.6 },
  { path: "/character-select", changeFrequency: "yearly", priority: 0.6 },
];

export default function sitemap() {
  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
