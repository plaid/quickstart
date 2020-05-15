FROM python:alpine

WORKDIR /opt/app
COPY . /opt/app
RUN pip3 install -r requirements.txt

ENV FLASK_APP=/opt/src/server.py
EXPOSE 5000
ENTRYPOINT ["python", "-m", "flask", "run", "--host=0.0.0.0"]
