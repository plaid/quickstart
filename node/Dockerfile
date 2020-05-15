FROM node:alpine

WORKDIR /opt/app
COPY . /opt/app
RUN npm install

EXPOSE 8000
ENTRYPOINT ["node", "index.js"]
