FROM python:3.9-slim

WORKDIR /code
ENV PYTHONPATH=${PYTHONPATH}:${PWD}

COPY pyproject.toml poetry.lock /code/
COPY wait-for-it.sh /
COPY ./cronjob/* /code/
RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

ENTRYPOINT ["/wait-for-it.sh","mongodb:27017","--timeout=60","--strict","--"]
CMD [ "python", "main.py" ]