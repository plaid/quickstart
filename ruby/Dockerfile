FROM ruby:alpine

WORKDIR /opt/app
COPY . .
RUN bundle install

EXPOSE 4567
ENTRYPOINT ["ruby", "/opt/src/app.rb", "-o", "0.0.0.0"]
