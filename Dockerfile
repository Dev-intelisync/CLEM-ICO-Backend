FROM node:16-alpine3.12 AS builder

# Install Python 3, alongside other build dependencies for node-gyp
RUN apk add --no-cache make g++ python3 python3-dev py3-pip wget build-base zlib-dev openssl-dev libffi-dev \
    bzip2-dev readline-dev ncurses-dev \
    && python3 -m ensurepip \
    && python3 -m pip install --upgrade pip \
    && ln -sf python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

# Install Python 2.7.18
RUN wget https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tgz \
    && tar xzf Python-2.7.18.tgz \
    && cd Python-2.7.18 \
    && ./configure --enable-shared --enable-unicode=ucs4 \
    && make \
    && make install \
    && cd .. \
    && rm -rf Python-2.7.18*

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

FROM node:16-alpine3.12
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app .

EXPOSE 1952

CMD ["node", "start"]
