require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const fs = require("fs");
const app = require("./src/app");
const listEndpoints = require("express-list-endpoints");

const endpoints = listEndpoints(app);

const collection = {
  info: {
    name: "Online Bookstore APIs",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: [],
};

endpoints.forEach((endpoint) => {
  endpoint.methods.forEach((method) => {
    collection.item.push({
      name: `${method} ${endpoint.path}`,
      request: {
        method: method,
        header: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
        url: {
          raw: `http://localhost:${process.env.PORT}${endpoint.path}`,
          protocol: "http",
          host: ["localhost"],
          port: process.env.PORT,
          path: endpoint.path.split("/").filter(Boolean),
        },
      },
    });
  });
});

fs.writeFileSync(
  "OnlineBookstore.postman_collection.json",
  JSON.stringify(collection, null, 2),
);

console.log("Postman Collection Generated Successfully");
