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
    middleName
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

  resources (sort: "publicationDate:desc", where: {isPublished: true}) {
    createdAt
    updatedAt
    title
    slug
    publicationDate
    summary
    category
    content
    
   
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
