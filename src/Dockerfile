# Use Node.js 18 as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything (not just src)
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "src/app.js"]
