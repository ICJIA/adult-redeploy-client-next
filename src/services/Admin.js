/* eslint-disable no-unused-vars */

import { EventBus } from "../event-bus";
const config = require("@/config.json");
import axios from "axios";

const { request } = require("graphql-request");
const graphqlApi = `${config.baseURL}/graphql`;
import moment from "moment";

const api = axios.create({
  baseURL: config.baseURL,
  timeout: 8000
});

const getUnindexedItemsQuery = `{
  pages {
    title
    slug
    createdAt
    updatedAt
    isPublished
    category {
        name
        slug
    }
  }
  meetings {
    title
    slug
    createdAt
    updatedAt
    isPublished
    category {
        name
        slug
    }
  }
  news:posts {
    title
    slug
    createdAt
    updatedAt
    isPublished
    category {
        name
        slug
    }
  }
  publications{
    title
    slug
    createdAt
    updatedAt
    isPublished
    category {
        name
        slug
    }
  }
   tags {
    name
    slug
    createdAt
    updatedAt
    isPublished
    
  }
   types {
    name
    slug
    createdAt
    updatedAt
    
  }

   categories {
    name
    slug
    createdAt
    updatedAt
    isPublished
    
  }
}`;

const getLogs = async token => {
  //api.defaults.headers.common["Authorization"] = token;
  try {
    const { data } = await api.get("/logs?_sort=createdAt:DESC");
    return data;
  } catch (e) {
    console.log("getLogs admin service error:: ", e);
  }
};

const getBuilds = async token => {
  try {
    // api.defaults.headers.common["Authorization"] = token;
    const { data } = await api.get("/builds?_sort=createdAt:DESC");
    const builds = data.map(item => {
      item.contentType = "build";
      return item;
    });
    return builds;
  } catch (e) {
    console.error("getBuilds admin service error: ", e);

    return [];
  }
};

const getServerStatus = async isDev => {
  let url = null;
  if (isDev) {
    url = config.status.dev;
  } else {
    url = config.status.prod;
  }
  try {
    const response = await fetch(url);
    let data = await response.json();

    return data;
  } catch (e) {
    console.error("getServerStatus admin service error: ", e);
    return [];
  }
};

const getUnindexedItems = async lastBuildDate => {
  try {
    let res = await request(graphqlApi, getUnindexedItemsQuery);
    //console.log(res);
    let unindexedContent = [];
    config.contentTypes.forEach(type => {
      if (type.isSearchable) {
        res[type.plural].forEach(item => {
          let lastBuildDateFormatted = moment(lastBuildDate).format();
          let itemUpdatedAtFormatted = moment(item.updatedAt).format();
          if (lastBuildDateFormatted < itemUpdatedAtFormatted) {
            item.type = type.plural;
            item.parentPath = type.parentPath;
            unindexedContent.push(item);
          }
        });
      }
    });
    return unindexedContent;
  } catch (e) {
    console.error("getUnindexedItems admin service error: ", e);
    return [];
  }
};

export { getLogs, getBuilds, getServerStatus, getUnindexedItems };
