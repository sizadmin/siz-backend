# Base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install --only=production

# Copy the rest of the application code to the container
COPY . .

# Install TypeScript locally
RUN npm install typescript

RUN npm install mongoose


# Build TypeScript code
RUN npx tsc

# Expose a port for the application
EXPOSE 8085

# Start the application
CMD [ "node", "dist/src/app.js" ]
