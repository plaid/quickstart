FROM node:alpine
WORKDIR /opt/app/

COPY package*.json /opt/app/

RUN npm install

EXPOSE 8000

CMD ["npm", "start"]
