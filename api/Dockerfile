FROM python:3.9-slim

WORKDIR /code
ENV PYTHONPATH=${PYTHONPATH}:${PWD}

COPY pyproject.toml poetry.lock /code/

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

CMD [ "uvicorn", "api.main:app", "--reload" ]