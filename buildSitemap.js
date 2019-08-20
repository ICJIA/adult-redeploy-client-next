/* eslint-disable no-console */
const { request } = require("graphql-request");
const jsonfile = require("jsonfile");
const config = require("./src/api/config.json");
const fs = require("fs");
var sm = require("sitemap");
// const slug = require("slug");
// slug.defaults.mode = "rfc3986";
const api = `${config.baseURL}/graphql`;
const apiDir = "./src/api";
const filename = "routes.json";
const sections = ["pages", "news", "tags", "resources", "meetings"];
let routes = [];

const query = `{
  pages (where: {isPublished: true}) {
    slug
    section {
      slug
    }
    
  }

  news: posts (where: {isPublished: true}) {
    slug
    
   
  }
  resources (where: {isPublished: true}) {
    slug
    category 
    
  }
  meetings (where: {isPublished: true}){
    slug
    category
  }

  tags {
    slug
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
        let catEnum = config.categoryEnums.resources.filter(cat => {
          return item.category === cat.enum;
        });

        path = `/resources/${catEnum[0].slug}/${item.slug}`;
      }
      /**
       *
       * Meetings
       *
       */
      let catEnum = config.categoryEnums.meetings.filter(cat => {
        return item.category === cat.enum;
      });
      if (section === "meetings") {
        path = `/meetings/${catEnum[0].slug}/${item.slug}`;
      }
      return path;
    });
    routes.push(...sectionRoutes);
  });
  let temp = routes.filter(Boolean);
  // remove dupes
  let paths = [...new Set(temp)];
  // add root
  paths.push("/");
  jsonfile.writeFile(`${apiDir}/${filename}`, paths, function(err) {
    if (err) console.error(err);
    console.log(`Created: ${apiDir}/${filename}`);
  });

  let urls = paths.map(route => {
    let obj = {};
    obj.url = route;
    obj.changefreq = "weekly";
    obj.priority = 0.8;
    // obj.lastmodrealtime = true;
    return obj;
  });

  let sitemap = sm.createSitemap({
    hostname: config.clientURL,
    cacheTime: 600000, //600 sec (10 min) cache purge period
    urls
  });

  fs.writeFileSync("./public/sitemap.xml", sitemap.toString());
  console.log(`Created: ./public/sitemap.xml`);
});
