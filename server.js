/**
 * Server configuration for production caching
 * This file should be used when deploying the app to a production server
 */

import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

const viteDevServer = process.env.NODE_ENV === "development"
  ? await import("vite").then(vite => vite.createServer({
    server: { middlewareMode: true },
  }))
  : null;

const app = express();

// Add compression
app.use(compression());

// Add logging
app.use(morgan("combined"));

// Serve static files with long-term caching
app.use(express.static("build/client", {
  maxAge: "1y", // Cache static assets for 1 year
  immutable: true, // Mark as immutable
  etag: true, // Enable ETags
}));

// Cache data files
app.use("/data", express.static("build/client/data", {
  maxAge: "1d", // Cache data files for 1 day
  etag: true,
}));

// Cache favicon and other static files
app.use(express.static("build/client", {
  maxAge: "1y",
  immutable: true,
  etag: true,
}));

// Add custom headers for all responses
app.use((req, res, next) => {
  const url = req.url;
  
  // Long-term cache for static assets
  if (url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Medium-term cache for data files
  if (url.match(/\/data\//)) {
    res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
  }
  
  // Short-term cache for HTML pages
  if (url.endsWith('.html') || url === '/') {
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  }
  
  next();
});

// Handle React Router routes
app.all("*", createRequestHandler({
  build: viteDevServer 
    ? () => viteDevServer.ssrLoadModule("virtual:react-router/server-build")
    : await import("./build/server/index.js"),
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
