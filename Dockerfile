FROM node:19-alpine

WORKDIR /app

COPY /package.json package.json
COPY /package-lock.json package-lock.json

RUN npm install

ENV LISTEN_HOST=0.0.0.0
ENV LISTEN_PORT=80
EXPOSE 80

COPY /sse.js sse.js

CMD ["node", "sse.js"]