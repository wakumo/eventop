FROM node:18.14.2

ENV APP_ROOT /app

# Create server directory
WORKDIR $APP_ROOT


# Install server dependencies
# COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package.json yarn.lock ./

# Install curl and jq for easier debug
# RUN apt-get update -y && apt-get upgrade -y
RUN yarn install
# Bundle server source
COPY . $APP_ROOT

RUN yarn build

EXPOSE 3000 3001

CMD [ "yarn", "run", "migrate_and_start_prod"]
