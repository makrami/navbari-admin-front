#Build Stage
FROM node:alpine as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

#Run Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
