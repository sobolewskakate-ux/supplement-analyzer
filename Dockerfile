# Starting from an official Node.js base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (Docker caches this layer if unchanged)
# This means rebuilds are faster if you only changed code, not dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your code
COPY server.js .

# Tell Cloud Run your app listens on port 8080
EXPOSE 8080

# Tell Docker how to start your app
CMD ["node", "server.js"]