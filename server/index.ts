import express from "express";
import http from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

async function start() {
  if (isProduction) {
    log("Starting production server...");
    serveStatic(app);
  } else {
    log("Starting development server with Vite...");
    await setupVite(app, server);
  }

  server.listen(port, () => log(`Server running on port ${port}`));
}

start();
