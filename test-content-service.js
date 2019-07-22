/* eslint-disable no-console */
const axios = require("axios");
const api = axios.create({
  baseURL: "https://spacbeta.icjia-api.cloud",
  timeout: 8000
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
  pages (where: {slug: ${slug}}) {
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
    category {
      name
      type {
        name
      }
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
    category {
      name
      type {
        name
      }
    }
    
  }
}`;
};

const getPubsForMenuQuery = `
{
  types (where: {name:"publication"}) {
    categories {
      name
      slug
    }
  }
}`;

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

const getPublicationsByCategoryQuery = slug => {
  return `{
  categories (where: {slug: "${slug}"}) {
    name
    slug
    summary
    
    publications(sort: "year:desc, title:asc") {
     title
     slug
    addToBanner
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
    category {
      name
      slug
    }
    }
   
   
  }
}`;
};

const getFeaturedPublicationsQuery = () => {
  return `{
  publications (where: {addToBanner: true}, sort: "bannerRank:desc") {
    title
    slug
    addToBanner
    bannerRank
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
    category {
      name
      slug
    }
  }
} `;
};

const getAllPublicationsQuery = () => {
  return `{
  publications (sort: "title:asc") {
    title
    slug
    addToBanner
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
    category {
      name
      slug
    }
  }
} `;
};

const getMeetingsByCategoryQuery = () => {
  return `{
  types(where: { name: "meeting" }) {
    name
    categories(sort: "name:asc") {
      name
      summary
      slug

      meetings(sort: "scheduledDate:desc, title:asc") {
        title
        slug
        createdAt
        updatedAt
        scheduledDate
        summary
        content
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
    }
  }
}
  `;
};

const getSingleMeetingQuery = slug => {
  return `{
  meetings (where: {slug: "${slug}", isPublished: true}) {
   
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
    category {
      name
      slug
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
      isPublished
      updatedAt
      createdAt
      tags {
        name
        slug
      }
      category {
        name
        slug
      }
    }
    publications(sort: "year:desc, title:asc", where: {isPublished: true}) {
      title
    slug
    addToBanner
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
    category {
      name
      slug
    }
    },
     meetings(sort: "scheduledDate:desc", where: {isPublished: true}) {
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
    category {
      name
      slug
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
      category {
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
    addToBanner
    bannerRank
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
    category {
      name
      slug
    }
  }
} 
`;
};

const getMeetingCategoryQuery = slug => {
  return `{
  categories(where: { slug: "${slug}" }) {
    name
    slug

    meetings(sort: "scheduledDate:desc", where: { isPublished: true }) {
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
      category {
        name
        slug
      }
      tags {
        slug
        name
      }
    }
  }
}
`;
};

const getPage = async ({ slug }) => {
  try {
    let page = await queryEndpoint(getPageQuery(slug));
    return page.data.data.pages;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getPost = async ({ slug }) => {
  try {
    let post = await queryEndpoint(getPostQuery(slug));
    return post.data.data.posts;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getPubsForMenu = async () => {
  try {
    let publications = await queryEndpoint(getPubsForMenuQuery);
    return publications.data.data.types;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getFrontPageNews = async ({ limit }) => {
  try {
    let news = await queryEndpoint(getFrontPageNewsQuery(limit));
    return news.data.data.posts;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getNews = async () => {
  try {
    let news = await queryEndpoint(getNewsQuery());
    return news.data.data.posts;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getPublicationsByCategory = async ({ slug }) => {
  try {
    let publications = await queryEndpoint(
      getPublicationsByCategoryQuery(slug)
    );
    return publications.data.data.categories;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getFeaturedPublications = async () => {
  try {
    let featured = await queryEndpoint(getFeaturedPublicationsQuery());
    return featured.data.data.publications;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getAllPublications = async () => {
  try {
    let publications = await queryEndpoint(getAllPublicationsQuery());
    return publications.data.data.publications;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getMeetingsByCategory = async () => {
  try {
    let categories = await queryEndpoint(getMeetingsByCategoryQuery());
    return categories.data.data.types;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getSingleMeeting = async slug => {
  try {
    let meeting = await queryEndpoint(getSingleMeetingQuery(slug));
    return meeting.data.data.meetings;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getContentByTag = async ({ slug }) => {
  try {
    let content = await queryEndpoint(getContentByTagQuery(slug));
    return content.data.data.tags;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getSinglePublication = async ({ slug }) => {
  try {
    let publication = await queryEndpoint(getSinglePublicationQuery(slug));

    return publication.data.data.publications;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

const getMeetingCategory = async ({ slug }) => {
  try {
    let category = await queryEndpoint(getMeetingCategoryQuery(slug));

    return category.data.data.categories;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

module.exports = {
  getPage,
  getPost,
  getFrontPageNews,
  getNews,
  getPubsForMenu,
  getPublicationsByCategory,
  getFeaturedPublications,
  getAllPublications,
  getMeetingsByCategory,
  getMeetingCategory,
  getSingleMeeting,
  getContentByTag,
  getSinglePublication
};
