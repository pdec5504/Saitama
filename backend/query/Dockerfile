FROM node:22-alpine


WORKDIR /usr/src/app


COPY package*.json ./


RUN apk update && apk upgrade


RUN npm install


COPY . .


CMD [ "npm", "start" ]