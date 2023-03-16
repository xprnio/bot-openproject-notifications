FROM node:latest
WORKDIR /home/node

COPY package.json ./
RUN npm install

COPY src/ ./src

CMD npm start
