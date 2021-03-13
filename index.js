import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import express from "express";
import multiparty from "multiparty";
import cloudinary from "cloudinary";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT = 3000;

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./public/index.html"));
});

app.post("/api/files", async (req, res) => {
  const form = new multiparty.Form();
  try {
  const [fields, files] = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve([fields, files])
    });
  });
  console.log(fields);
  const {image: [{path}] } = files;
  const {url: imageUrl, ...result} = await cloudinary.v2.uploader.upload(path);
  const pet =  {
    ...Object.fromEntries(
      Object.entries(fields)
        .map(([key, [value]]) => [key, value])
    ),
    imageUrl
  };

  console.log(pet, result);
  res.status(201).send(pet);
} catch (err) {
  console.error(err);
  res.status(500).send({
    message: "internal server error"
  });
}
});

app.listen(PORT, () => console.log("Listening on " + PORT));