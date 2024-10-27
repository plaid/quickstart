FROM python:alpine

WORKDIR /opt/app
COPY . .
WORKDIR /opt/app/python

RUN pip3 install -r requirements.txt

ENV DJANGO_SETTINGS_MODULE=quickstart.settings
EXPOSE 8000
ENTRYPOINT ["python"]
CMD ["manage.py", "runserver", "0.0.0.0:8000"]
