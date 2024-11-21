# Dockerfile for React frontend
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose the port that Vite uses
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]