import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

async function start() {
  let server;

  if (isProduction) {
    log("Starting production server...");
    serveStatic(app);
    server = await registerRoutes(app);
  } else {
    log("Starting development server with Vite...");
    server = await registerRoutes(app);
    await setupVite(app, server);
  }

  server.listen(port, () => log(`Server running on port ${port}`));
}

start();
