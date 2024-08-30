# Use the official Node.js 20.17-alpine image as the base
FROM node:20.17-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install

# Copy the entire source code into the container
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set environment variable to development
ENV NODE_ENV=development

# # Install development tools (optional, if needed for debugging)
# RUN yarn global add nodemon

# Command to start the application in development mode with hot-reloading
CMD ["yarn", "start:dev"]
