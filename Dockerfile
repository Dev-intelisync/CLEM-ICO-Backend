FROM node:16-alpine3.12 AS builder

# Install dependencies for building Python 2.7.18
RUN apk add --no-cache make g++ wget build-base zlib-dev openssl-dev libffi-dev \
    bzip2-dev readline-dev ncurses-dev \
    && wget https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tgz \
    && tar xzf Python-2.7.18.tgz \
    && cd Python-2.7.18 \
    && ./configure --enable-shared --enable-unicode=ucs4 \
    && make \
    && make install \
    && cd .. \
    && rm -rf Python-2.7.18* \
    && apk del wget build-base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:16-alpine3.12
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app .

EXPOSE 1952

CMD ["node", "start"]
