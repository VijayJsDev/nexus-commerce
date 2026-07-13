# Use an official Node runtime as a parent image
FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application in development mode
# Note: For production, we would build the TypeScript and run `node dist/server.js`
CMD ["npm", "run", "dev"]
