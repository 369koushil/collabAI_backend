# Use the official Node.js Alpine image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your application will run on
EXPOSE 3000

# Run the application in production mode
CMD ["npm", "run", "start"]
