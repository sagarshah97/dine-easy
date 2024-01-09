FROM node:16.15.1 as build
WORKDIR /dineasy

COPY package.json .
RUN npm install
COPY . .

RUN CI=false npm run build
FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /dineasy/build /usr/share/nginx/html