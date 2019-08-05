/* eslint-disable no-console */
/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import { EventBus } from "@/event-bus";
const config = require("@/api/config.json");

const axios = require("axios");
const api = axios.create({
  baseURL: config.baseURL,
  timeout: 8000
});

api.interceptors.request.use(config => {
  NProgress.start();
  return config;
});

api.interceptors.response.use(response => {
  NProgress.done();
  return response;
});

async function queryEndpoint(query) {
  let content = await api({
    url: "/graphql",
    method: "post",
    data: {
      query
    }
  });
  return content;
}

const getPageQuery = slug => {
  return `{
  pages (where: {slug: "${slug}"}) {
    id
    createdAt
    updatedAt
    title
    showToc
    slug
    content
    isPublished
    summary
    tags {
      name
      slug
    }
    
    
  }
}`;
};

const getPostQuery = slug => {
  return `{
  posts  (where: {slug: "${slug}"}) {
    id
    createdAt
    updatedAt
    title
    slug
    content
    isPublished
    summary
    tags {
      name
      slug
    }
    
    
  }
}`;
};

const getFrontPageNewsQuery = limit => {
  return `{
  posts(sort: "createdAt:desc", limit: ${limit}, where: {isPublished: true}) {
    title
    isPublished
    slug
    tags {
      name
      slug
    }
    summary
    createdAt
    isPublished
    
  }
}`;
};

const getNewsQuery = () => {
  return `{
  posts(sort: "createdAt:desc", where: {isPublished: true}) {
    title
    slug
    isPublished
    tags {
      name
      slug
    }
    summary
    createdAt
    isPublished
    
  }
}`;
};

const getFeaturedPublicationsQuery = () => {
  return `{
  publications  {
    title
    slug
    category
    tags {
      name
      slug
    }
    summary
    createdAt
    isPublished
    year
    file {
      name
      url
    }
    externalURL
    thumbnail {
      url
      name
    }
    
  }
} `;
};

const getAllPublicationsQuery = () => {
  return `{
  publications (sort: "title:asc") {
    title
    slug
    category
    tags {
      name
      slug
    }
    summary
    createdAt
    isPublished
    year
    file {
      name
      url
    }
    externalURL
    thumbnail {
      url
      name
    }
    
  }
} `;
};

const getSingleMeetingQuery = slug => {
  return `{
  meetings (where: {slug: "${slug}", isPublished: true}) {
    category
    createdAt
    updatedAt
    isPublished
    summary
    title
    slug
    isPublished
    content
    scheduledDate
    materials {
      name
      url
    }
    
    tags {
      slug
      name
    }
  }

}`;
};

const getContentByTagQuery = slug => {
  return `
  {
  tags (where: {slug: "${slug}"}){
    name
    slug
    content
    pages(sort: "title:asc", where: {isPublished: true}) {
      title
			slug
      path
      content
      showToc
      isPublished
      updatedAt
      createdAt
      tags {
        name
        slug
      }
     
    }
    publications(sort: "year:desc, title:asc", where: {isPublished: true}) {
      title
    slug
    category
    
    tags {
      name
      slug
    }
    summary
    createdAt
    isPublished
    year
    file {
      name
      url
    }
    externalURL
    thumbnail {
      url
      name
    }
    
    },
     meetings(sort: "scheduledDate:desc", where: {isPublished: true}) {
      createdAt
    updatedAt
    isPublished
    summary
    title
    category
    slug
    isPublished
    content
    scheduledDate
    materials {
      name
      url
    }
    
    tags {
      slug
      name
    }
    }
    
    news: posts(sort: "createdAt:desc", where: {isPublished: true}) {
      title
      slug
      isPublished
      createdAt
      updatedAt
      content
      tags {
        name
        slug
      }
     
    }
  }
}
  `;
};

const getSinglePublicationQuery = slug => {
  return `{
  publications (where: {slug: "${slug}"})  {
    title
    slug
    category
    tags {
      name
      slug
    }
    summary
    createdAt
    isPublished
    year
    file {
      name
      url
    }
    externalURL
    thumbnail {
      url
      name
    }
   
  }
} 
`;
};

const getSectionsQuery = () => {
  return `{
  sections (sort: "order:asc") {
    title
    slug
    summary
    searchMeta
    summary
    order
    hasSubMenus
    displayNav
    displayFooter
    displayDrawer
    
    pages {
      title
      slug
      isPublished
      summary
    }
  }
}`;
};

const getPageBySectionQuery = (section, slug) => {
  return `{
  sections(where: { slug: "${section}" }) {
    title
    slug
    summary
    hasSubMenus
    searchMeta
    pages(where: { slug: "${slug}" }) {
      id
      createdAt
      updatedAt
      title
      showToc
      slug
      content
      isPublished
      summary
      tags {
        name
        slug
      }
      
    }
  }
}`;
};

const getSiteDescriptionQuery = slug => {
  return `{
  sites (where: {isPublished: true, slug: "${slug}"}){
    id
    title
    slug
    summary
    content
    siteType
  }
}`;
};

const getAllSiteDescriptionsQuery = () => {
  return `{
  sites (sort: "title:asc", where: {isPublished: true}){
    id
    title
    slug
    summary
    content
    siteType
    showToc
  }
}`;
};

const getPage = async ({ slug }) => {
  try {
    // console.log(slug);
    let page = await queryEndpoint(getPageQuery(slug));
    return page.data.data.pages;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("getPage error", e.toString());
    return [];
  }
};

const getPost = async ({ slug }) => {
  try {
    let post = await queryEndpoint(getPostQuery(slug));
    return post.data.data.posts;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getFrontPageNews = async ({ limit }) => {
  try {
    let news = await queryEndpoint(getFrontPageNewsQuery(limit));
    return news.data.data.posts;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getNews = async () => {
  try {
    let news = await queryEndpoint(getNewsQuery());
    return news.data.data.posts;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getFeaturedPublications = async () => {
  try {
    let featured = await queryEndpoint(getFeaturedPublicationsQuery());
    return featured.data.data.publications;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getAllPublications = async () => {
  try {
    let publications = await queryEndpoint(getAllPublicationsQuery());
    return publications.data.data.publications;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getSingleMeeting = async ({ slug }) => {
  try {
    let meeting = await queryEndpoint(getSingleMeetingQuery(slug));
    return meeting.data.data.meetings;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getContentByTag = async ({ slug }) => {
  try {
    let content = await queryEndpoint(getContentByTagQuery(slug));
    return content.data.data.tags;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getSinglePublication = async ({ slug }) => {
  try {
    let publication = await queryEndpoint(getSinglePublicationQuery(slug));

    return publication.data.data.publications;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getSections = async () => {
  try {
    let sections = await queryEndpoint(getSectionsQuery());
    return sections.data.data.sections;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getPageBySection = async ({ section, slug }) => {
  try {
    let sections = await queryEndpoint(getPageBySectionQuery(section, slug));
    return sections.data.data.sections;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getSiteDescription = async ({ slug }) => {
  try {
    let sites = await queryEndpoint(getSiteDescriptionQuery(slug));
    return sites.data.data.sites;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getAllSiteDescriptions = async () => {
  try {
    let sites = await queryEndpoint(getAllSiteDescriptionsQuery());
    return sites.data.data.sites;
  } catch (e) {
    EventBus.$emit("contentServiceError", e.toString());
    console.log("contentServiceError", e.toString());
    return [];
  }
};

export {
  getPage,
  getPost,
  getFrontPageNews,
  getNews,
  getFeaturedPublications,
  getAllPublications,
  getSingleMeeting,
  getContentByTag,
  getSinglePublication,
  getSections,
  getPageBySection,
  getSiteDescription,
  getAllSiteDescriptions
};
