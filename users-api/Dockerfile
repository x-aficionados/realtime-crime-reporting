FROM python:3.9-slim

WORKDIR /code
ENV PYTHONPATH=${PYTHONPATH}:${PWD}

COPY pyproject.toml poetry.lock /code/

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

# FROM confluentinc/cp-kafka-connect:5.3.0
# ENV CONNECT_PLUGIN_PATH="/usr/share/java,/usr/share/confluent-hub-components"
# RUN  confluent-hub install --no-prompt confluentinc/kafka-connect-datagen:latest

CMD [ "uvicorn", "users_api.main:app", "--reload" ]