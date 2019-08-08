/* eslint-disable no-console */
const { request } = require("graphql-request");
const jsonfile = require("jsonfile");

const config = require("./src/api/config.json");
const fs = require("fs");

const api = `${config.baseURL}/graphql`;
const apiDir = "./src/api";
const fileName = "searchIndex.json";

const query = `{
  pages (where: {isPublished: true}) {
    createdAt
    updatedAt
    title
    summary
    content
    slug
    searchMeta
    isPublished
    
    section {
      title
      slug
      summary
      searchMeta
      summary
    }
    
    tags {
      name
      slug
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
    
    
    tags {
      name
      slug
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
    category
    thumbnail {
            url
        }
    isPublished
   
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
    category
    slug
    isPublished
    materials {
      name
      url
    }
   
    tags {
      name
      slug
    }
    
  }

  
  sites {
    id
    title
    slug
    summary
    content
    searchMeta
    siteType
  }


  biographies (where: {isPublished: true}){
   
    firstName
    lastName
    membership
    isPublished
    order
    prefix
    suffix
    slug
    title
    content
    category
    alphabetizeBy
     headshot {
      url
      name
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
