# Use an official Node.js runtime as a parent image
FROM node:20.10.0

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV CLICKHOUSE_HOST='https://x0ymw24usp.ap-south-1.aws.clickhouse.cloud:8443'
ENV CLICKHOUSE_USR='default'
ENV CLICKHOUSE_PWD='_lgnkF0xFiiYr'
ENV OPEN_AI_API_KEY='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'
ENV RABBITMQ_URLS='amqp://username:password@localhost:5672'
ENV RABBITMQ_QUEUE='rabbitmq_queue'

# Start the NestJS application
CMD ["npm", "run", "start:prod"]
