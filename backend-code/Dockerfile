# Use an official Node.js runtime as a parent image
FROM node:20.10.0

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000


# Start the NestJS application
CMD ["npm", "run", "start:prod"]
