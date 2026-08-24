FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/buzzapi
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

RUN pip3 install --upgrade pip
RUN apt-get update

# Copy the rest of the application code
COPY . .