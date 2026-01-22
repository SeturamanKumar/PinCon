FROM node:18-alpine

WORKDIR /app

RUN apk update && apk add openssl

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start"]