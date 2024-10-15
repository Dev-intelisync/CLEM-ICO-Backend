FROM node:16-alpine AS builder

RUN apk add --no-cache make g++ wget build-base zlib-dev openssl-dev libffi-dev \
    && wget https://www.python.org/ftp/python/2.7.1/Python-2.7.1.tgz \
    && tar xzf Python-2.7.1.tgz \
    && cd Python-2.7.1 \
    && ./configure --enable-shared --enable-unicode=ucs4 \
    && make \
    && make install \
    && cd .. \
    && rm -rf Python-2.7.1* \
    && apk del wget build-base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:16-alpine
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app .

EXPOSE 1952

CMD ["node", "start"]
