/* eslint-disable no-console */
const { request } = require("graphql-request");
const jsonfile = require("jsonfile");
const config = require("./src/config.json");
const fs = require("fs");
var sm = require("sitemap");
// const slug = require("slug");
// slug.defaults.mode = "rfc3986";
const api = `${config.baseURL}/graphql`;
const apiDir = "./src/api";
const filename = "routes.json";
const sections = ["pages", "news", "tags", "resources", "meetings"];
const publicPath = "/adultredeploy";
let routes = [];
const lastModMap = new Map();

const query = `{
  pages (where: {isPublished: true}) {
    slug
    updatedAt
    section {
      slug
    }
    
  }

  news: posts (where: {isPublished: true}) {
    slug
    updatedAt
    
   
  }
  resources (where: {isPublished: true}) {
    slug
    updatedAt
    category 
    
  }
  meetings (where: {isPublished: true}){
    slug
    updatedAt
    category
  }

  tags {
    slug
    updatedAt
  }
  
}`;

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir);
  console.log(`Created: ${apiDir}/`);
}

request(api, query).then(res => {
  sections.forEach(section => {
    let sectionRoutes = res[section].map(item => {
      let path;
      /**
       *
       * Pages
       *
       */
      if (section === "pages") {
        if (item.section.slug === item.slug) {
          path = `/${item.section.slug}`;
        } else {
          path = `/${item.section.slug}/${item.slug}`;
        }
      }
      /**
       *
       * News
       *
       */
      if (section === "news") {
        path = `/news/${item.slug}`;
      }
      /**
       *
       * Tags
       *
       */
      if (section === "tags") {
        path = `/tags/${item.slug}`;
      }
      /**
       *
       * Resources
       *
       */
      if (section === "resources") {
        let catEnum = config.strapiEnums.resources.filter(cat => {
          return item.category === cat.enum;
        });

        path = `/resources/${catEnum[0].slug}/${item.slug}`;
      }
      /**
       *
       * Meetings
       *
       */
      let catEnum = config.strapiEnums.meetings.filter(cat => {
        return item.category === cat.enum;
      });
      if (section === "meetings") {
        path = `/about/meetings/${catEnum[0].slug}/${item.slug}`;
      }
      lastModMap.set(`${publicPath}${path}`, item.updatedAt);
      return `${config.publicPath}${path}`;
    });
    routes.push(...sectionRoutes);
  });

  /**
   * Add categories: /:category/:slug
   */

  for (let category in config.strapiEnums) {
    let categoryRoutes = config.strapiEnums[category].map(m => {
      let singleRoute;
      if (category === "meetings") {
        singleRoute = `${publicPath}/about/${category}/${m.slug}`;
      } else {
        singleRoute = `${publicPath}/${category}/${m.slug}`;
      }

      lastModMap.set(`${singleRoute}`, new Date());
      return singleRoute;
    });
    routes.push(...categoryRoutes);
  }

  // console.log(routes);
  let temp = routes.filter(Boolean);
  // remove dupes
  let paths = [...new Set(temp)];
  // add root
  paths.push(`${publicPath}`);
  lastModMap.set(`${publicPath}`, new Date());
  jsonfile.writeFile(`${apiDir}/${filename}`, paths, function(err) {
    if (err) console.error(err);
    console.log(`Created: ${apiDir}/${filename}`);
  });

  let urls = paths.map(route => {
    let obj = {};
    obj.url = route;
    obj.changefreq = "weekly";
    obj.priority = 0.8;
    obj.lastmod = lastModMap.get(route);
    return obj;
  });

  let sitemap = sm.createSitemap({
    hostname: `${config.clientURL}`,
    cacheTime: 600000, //600 sec (10 min) cache purge period
    urls
  });

  fs.writeFileSync("./public/sitemap.xml", sitemap.toString());
  console.log(`Created: ./public/sitemap.xml`);
});
