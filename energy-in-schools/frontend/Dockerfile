# download node image
FROM node:11

# prepare app directory
RUN mkdir -p /usr/src/app

# set working directory
WORKDIR /usr/src/app

# copy package.json file to working directory
COPY package.json yarn.lock /usr/src/app/

# install dependencies
RUN npm install -g yarnpkg
RUN yarn install --frozen-lockfile

# copy entire local directory into working directory
COPY . /usr/src/app

# expose port which container will listen on
EXPOSE 8000

# start front end
CMD [ "yarn", "start" ]
