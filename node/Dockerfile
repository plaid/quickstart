FROM node:alpine

WORKDIR /opt/app
COPY . .
RUN npm install

EXPOSE 8000
ENTRYPOINT ["node", "index.js"]
