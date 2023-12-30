// Userapi/src/dbClient.js

var redis = require("redis");

const { REDIS_HOST, REDIS_PORT } = process.env;

var db = redis.createClient({
  host: REDIS_HOST || 'localhost',
  port: REDIS_PORT || 6379,
  retry_strategy: () => {
    return new Error("Retry time exhausted");
  }
});

process.on('SIGINT', function() {
  db.quit();
});

module.exports = db;
