# syntax=docker/dockerfile:1
FROM node:16-alpine
COPY . .
RUN npm install --production
CMD ["node", "index.js"]