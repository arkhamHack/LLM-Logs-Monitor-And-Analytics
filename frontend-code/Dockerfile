FROM --platform=linux/amd64 node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Start the NestJS application
CMD ["npm", "start"]
