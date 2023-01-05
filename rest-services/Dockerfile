FROM ubuntu:bionic

RUN export HTTP_PROXY=http://sysproxy.wal-mart.com:8080
RUN export HTTPS_PROXY=http://sysproxy.wal-mart.com:8080
RUN apt-get update 
RUN apt-get install gnupg apt-utils -y

RUN apt-get install -y curl


RUN curl -fsSL https://deb.nodesource.com/setup_10.x | bash -

RUN apt-get install -y -q \
    git \
    tree \
    nodejs \
    build-essential \
    gcc \
    g++ \
    make \
    && apt-get clean 

RUN mkdir -p /project/rest

EXPOSE 9085/tcp

WORKDIR /project/rest
RUN rm -rf wallet/*
COPY . ./
RUN rm -rf node_modules package-lock.json
RUN bash -c "npm install" 
RUN bash -c "npm rebuild pkcs11js --update-binary"
RUN ls -la
RUN chmod 777 node_modules
COPY node_modules ./
RUN ls -la
# RUN rm -rf  *.sh Dockerfile
