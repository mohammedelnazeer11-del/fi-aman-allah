const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY = "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";
const PORT = process.env.PORT || 3000;

const HTML = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const options = {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
      };
      const apiReq = https.request(options, apiRes => {
        let data = "";
        apiRes.on("data", chunk => data += chunk);
        apiRes.on("end", () => {
          res.writeHead(apiRes.statusCode, { "Content-Type": "application/json" });
          res.end(data);
        });
      });
      apiReq.on("error", err => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      });
      apiReq.write(body);
      apiReq.end();
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
