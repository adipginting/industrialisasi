FROM node:20-bookworm AS build
WORKDIR /usr/local/app
COPY package*.json ./

RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm AS run
WORKDIR /usr/local/app

COPY --from=build /usr/local/app/package*.json ./
COPY --from=build /usr/local/app/dist ./dist

RUN npm ci --only=production

EXPOSE 4000

CMD ["node", "dist/main.js"]
