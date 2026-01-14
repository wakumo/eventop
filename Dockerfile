FROM node:18.14.2 AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=node:node . .
RUN yarn build


FROM node:18.14.2-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
COPY --from=build /usr/src/app/dist ./dist
COPY --chown=node:node entrypoint.sh ./entrypoint.sh

RUN yarn install --frozen-lockfile --production \
  && yarn cache clean \
  && chmod +x entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/src/main.js"]