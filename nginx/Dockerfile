FROM nginx:mainline-alpine
LABEL maintainer="Karl Fathi <karl@pixelfordinner.com>"

ENV LANG C.UTF-8

RUN rm /etc/nginx/nginx.conf && \
    rm /etc/nginx/fastcgi_params && \
    rm -rf /etc/nginx/conf.d && \
    rm -rf /etc/nginx/vhost.d && \
    mkdir -p /etc/nginx/conf.d && \
    mkdir -p /etc/nginx/vhost.d

# build this using docker-compose up from parent directory !!!
# use this https://github.com/johndpope/docker-wildcard-letsencrypt?organization=johndpope&organization=johndpope
# to create wildcard certificate and store in letsencrypt/* inside this nginx folder
RUN mkdir -p /etc/letsencrypt/
COPY nginx/letsencrypt/ /etc/letsencrypt/
RUN ls -la /etc/letsencrypt/*
COPY nginx/data/config/ /etc/nginx/config/
COPY nginx/data/nginx.conf /etc/nginx/
COPY nginx/data/proxy.conf /etc/nginx/
COPY nginx/data/fastcgi_params /etc/nginx/
COPY nginx/data/mime.types /etc/nginx/
COPY nginx/default.conf /etc/nginx/conf.d/

VOLUME ["/var/cache/nginx"]

EXPOSE 80 443

CMD ["nginx"]
