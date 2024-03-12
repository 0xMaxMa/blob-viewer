FROM node:18-alpine

RUN apk add jq

RUN apk add --no-cache make gcc g++ python3

RUN mkdir /home/node/app

RUN apk add --no-cache git openssh

WORKDIR /home/node/app

COPY . .

RUN yarn
