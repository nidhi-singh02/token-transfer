FROM node:12.22.1-alpine3.12 

RUN mkdir /app

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . ./

EXPOSE 3001



