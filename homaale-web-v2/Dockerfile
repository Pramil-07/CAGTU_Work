# Using node18 from docker repository
FROM node:18-alpine

# Creating working directory
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 8020

CMD ["yarn", "start"]
