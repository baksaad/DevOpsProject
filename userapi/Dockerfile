FROM node:16
 
WORKDIR /usr/src/app
 
# Copy dpendencies
COPY package*.json ./
 
# Install dependencies
RUN npm install
 
# Copy source code
COPY . .
 
# Expose port 3000
EXPOSE 3000
 
# Define command to run the app
CMD [ "node", "src/index.js" ]