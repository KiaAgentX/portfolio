FROM node:22-alpine AS build
WORKDIR /admin
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /admin/dist /usr/share/nginx/html
