const axios = require("axios");
const jsonfile = require("jsonfile");
const config = require("./src/config.json");
const fs = require("fs");
const api = `${config.baseURL}/upload/files`;
const apiDir = "./src/api";
const fileName = "filemap.json";

const getFileInfo = async () => {
  try {
    return await axios.get(api);
  } catch (error) {
    console.error(error);
  }
};

async function init() {
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir);
    console.log(`Created: ${apiDir}/`);
  }
  let contents = await getFileInfo();
  //   console.log(contents.data);
  jsonfile.writeFile(`${apiDir}/${fileName}`, contents.data, function(err) {
    if (err) console.error(err);
    console.log(`Created: ${apiDir}/${fileName}`);
  });
}

init();
