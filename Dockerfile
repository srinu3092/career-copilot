FROM node:20-alpine
WORKDIR /app

# Copy lockfiles and dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build and tsx)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React production assets
RUN npm run build

# Expose the application port
EXPOSE 3000

ENV NODE_ENV=production

# Start the Express server
CMD ["npx", "tsx", "server.ts"]
