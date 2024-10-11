FROM python:alpine

WORKDIR /opt/app
COPY . .
WORKDIR /opt/app/python

RUN pip3 install -r requirements.txt

ENV FLASK_APP=/opt/app/python/server.py
EXPOSE 8000
ENTRYPOINT ["python"]
CMD ["-m", "flask", "run", "--host=0.0.0.0", "--port=8000"]
