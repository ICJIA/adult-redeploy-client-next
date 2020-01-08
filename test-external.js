/* eslint-disable no-console */

const axios = require("axios");
const api = axios.create({
  baseURL: "https://researchhub.icjia-api.cloud",
  timeout: 8000
});

async function queryExternalEndpoint(query) {
  let content = await api({
    url: "/graphql",
    method: "post",
    data: {
      query
    }
  });
  return content;
}

const getRecentArticlesQuery = () => {
  return `{
    articles (limit: 3) {
      title
      status
     createdAt
      abstract
      authors 
      slug
      thumbnail
    }
  }`;
};

const getAppCount = async () => {
  try {
    let appCount = await queryResearchHub(getAppCountQuery());
    console.log("appCount: ", appCount.data.data);
    return [];
  } catch (e) {
    console.log("contentServiceError", e.toString());
    NProgress.done();
    return [];
  }
};

const getRecentArticles = async () => {
  try {
    let articles = await queryExternalEndpoint(getRecentArticlesQuery());
    console.log(articles.data.data.articles);
    return articles.data.data.articles;
  } catch (e) {
    console.log("contentServiceError", e.toString());
    return [];
  }
};

getRecentArticles();
