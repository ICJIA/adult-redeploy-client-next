const { request } = require("graphql-request");
const jsonfile = require("jsonfile");

const config = require("./src/config.json");
const fs = require("fs");

const api = `${config.baseURL}/graphql`;
const apiDir = "./src/api";
const fileName = "search.json";

const query = `{
  pages (where: {isPublished: true}) {
    createdAt
    updatedAt
    title
    path
    summary
    content
    slug
    searchMeta
    isPublished
    user {
      username
    }
    
    tags {
      name
      slug
    }
    category {
      name
      summary
      slug
      type {
        name
      }
    }
    
  }
  news: posts (sort: "createdAt:desc", where: {isPublished: true}) {
    createdAt
    updatedAt
    title
    slug
    searchMeta
    content
    isPublished
    summary
    user {
      username
    }
    
    tags {
      name
      slug
    }
    category {
      name
      summary
      slug
      type {
        name
      }
    }
    
  }
  publications (sort: "year:desc, title:asc", where: {isPublished: true}) {
    createdAt
    updatedAt
    title
    slug
    summary
    externalURL
    year
    searchMeta
    addToBanner
    thumbnail {
            url
        }
    isPublished
    category {
      name
      summary
      slug
      type {
        name
      }
    }
    tags {
      name
      slug
    }
    file {
      url
      name
    }
    
  }
  meetings (sort: "scheduledDate:desc", where: {isPublished: true}){
    title
    createdAt
    updatedAt
    scheduledDate
    summary
    searchMeta
    content
    slug
    isPublished
    materials {
      name
      url
    }
    category {
      name
      slug
    }
    tags {
      name
      slug
    }
    
  }
  
 
 
  
  
  
}`;

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir);
  console.log(`Created: ${apiDir}/`);
}

request(api, query).then(res => {
  jsonfile.writeFile(`${apiDir}/${fileName}`, res, function(err) {
    if (err) console.error(err);
    console.log(`Created: ${apiDir}/${fileName}`);
  });
});
