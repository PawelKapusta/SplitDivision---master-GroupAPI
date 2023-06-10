FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env .

RUN npm run build

EXPOSE 5002

CMD [ "npm", "start" ]