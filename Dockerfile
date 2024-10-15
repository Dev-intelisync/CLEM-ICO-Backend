FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app .

EXPOSE 1952

CMD ["node", "app.js"]
