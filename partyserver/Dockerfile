FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080

EXPOSE 8080

ENV SOCKPORT=8081

EXPOSE 8081

ENV PROTOCOLTYPE='wss'

CMD [ "npm", "start"]