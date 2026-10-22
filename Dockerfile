# Generated for Glama & Docker MCP Server Registry
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY bin ./bin

ENV NODE_ENV=production

ENTRYPOINT ["node", "bin/mcp-server.js"]
