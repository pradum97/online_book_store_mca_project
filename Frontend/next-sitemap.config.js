/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://crm.grreality.com",
  generateRobotsTxt: true,
  changefreq: "daily",
  priority: 0.7,
  additionalPaths: async (config) => [
    await config.transform(config, "/lealead-masterds"),
    await config.transform(config, "/project"),
    await config.transform(config, "/dashboard"),
  ],
  transform: async (config, path) => ({
    loc: path,
    changefreq: "daily",
    priority: 0.7,
    lastmod: new Date().toISOString(),
  }),
};
