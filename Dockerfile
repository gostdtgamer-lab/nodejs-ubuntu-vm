# Step 1: Use an official Node.js base image (using standard instead of slim to ensure tar/gzip utilities are present)
FROM node:20

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package files first to optimize Docker's build cache
COPY package*.json ./

# Step 4: Install your Node.js dependencies from package.json
RUN npm ci --only=production

# Step 5: Copy the rest of your application files (including server.js)
COPY . .

# Step 6: Expose the network port your server listens on
EXPOSE 3000

# Step 7: Set environment variables
ENV PORT=3000

# Step 8: Define the command to execute your script
CMD [ "node", "server.js" ]
