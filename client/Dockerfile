FROM nginx:1-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY index.html /usr/share/nginx/html/
COPY ./js /usr/share/nginx/html/js
COPY ./css /usr/share/nginx/html/css
COPY ./assets /usr/share/nginx/html/assets

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]