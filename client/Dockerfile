FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install --save-dev webpack webpack-cli webpack-dev-server babel-loader @babel/core @babel/preset-env @babel/preset-react style-loader css-loader
COPY . .
CMD ["npm", "start"]
