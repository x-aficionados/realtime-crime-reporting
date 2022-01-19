# pull official base image
FROM node:16-alpine

# set working directory
WORKDIR /code

# add `/app/node_modules/.bin` to $PATH
ENV PATH /code/node_modules/.bin:$PATH

# install app dependencies
COPY package.json yarn.lock postcss.config.js tailwind.config.js tsconfig.json ./
RUN yarn install --silent

# start app
CMD ["yarn", "start"]