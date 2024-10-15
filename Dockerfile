FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app .

EXPOSE 1952

CMD ["node", "start"]
