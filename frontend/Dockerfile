# pull official base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY ./frontend/.npmrc ./
COPY ./frontend/package*.json ./
RUN npm install

# add app
COPY ./frontend ./

# start app
CMD ["npm", "start"]
