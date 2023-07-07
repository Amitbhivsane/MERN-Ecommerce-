const path = require("path");
const app = require("./app");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//handel uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error :${err.message}`);
  console.log(`shutting down the server due to uncaughtException rejection`);
  process.exit(1);
});

//config
dotenv.config({ path: "backend/config/config.env" });

//connecting database
connectDatabase();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server is working on http://localhost:${process.env.PORT}`);
});

//unhandeled promise rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server due to unhandel promis Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
