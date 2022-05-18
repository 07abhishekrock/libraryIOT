FROM node:16

WORKDIR /usr/library/app

COPY package*.json ./

RUN npm install

RUN npm run build

COPY . .

EXPOSE 3002

CMD ["npm" , "run" , "start"]