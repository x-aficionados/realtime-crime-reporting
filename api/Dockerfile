FROM python:3.9-slim

WORKDIR /code
ENV PYTHONPATH=${PYTHONPATH}:${PWD}

COPY pyproject.toml poetry.lock /code/
COPY wait-for-it.sh /

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

ENTRYPOINT ["/wait-for-it.sh","mongo-connect:8083","--timeout=60","--strict","--"]
CMD [ "uvicorn", "api.main:app", "--reload" ]