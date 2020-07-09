FROM ruby:alpine

WORKDIR /opt/app
COPY . .
RUN bundle install

EXPOSE 4567
ENTRYPOINT ["ruby"]
CMD ["app.rb", "-o", "0.0.0.0"]
