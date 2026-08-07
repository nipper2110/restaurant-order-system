import { Worker } from "bullmq";
import sharp from "sharp";
import path from "path";

// Create a worker to proess the image optimizarion job
const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, fileName, width, height, quality } = job.data;
    const optimizedImage = path.join(
      __dirname,
      "../../..",
      "/uploads/optimize",
      fileName,
    );
    await sharp(filePath)
      .resize(width, height)
      .webp({ quality: quality })
      .toFile(optimizedImage);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT!) || 6379,
      maxRetriesPerRequest: null,
    },
  },
);

imageWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

imageWorker.on("failed", (job: any, err) => {
  console.log(`Job ${job.id} failed with ${err.message}`);
});
