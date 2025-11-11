import express from "express";
import http from "http";
import { WebSocketServer } from "ws"; // ← wichtig
import { setupVite, serveStatic, log } from "./vite";
import { handleWsConnection } from "./routes"; // hier kommen gleich die WS-Events hin

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

  // 🧩 WebSocket-Server hinzufügen
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (socket) => handleWsConnection(socket));

  server.listen(port, () => log(`Server running on port ${port}`));
}

start();
