const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
  token: {
    keys: process.env.ACCESS_TOKEN_KEY,
    age: process.env.ACCESS_TOKEN_AGE,
    refresh: process.env.REFRESH_TOKEN_KEY,
  },
};
module.exports = config;
