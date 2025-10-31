FROM node:24-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml .
COPY packages/service/package.json packages/service/package.json
RUN corepack enable && yarn
COPY packages/service/lib packages/service/lib

WORKDIR /usr/src/app/packages/service
EXPOSE 8080
CMD ["yarn","start"]