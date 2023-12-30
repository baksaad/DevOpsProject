// src/dbClient.js

const redis = require("redis");
const configure = require('./configure');

const config = configure();
const db = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  retry_strategy: () => {
    return new Error("Retry time exhausted");
  },
});

// Handle SIGINT to quit the Redis connection gracefully
process.on('SIGINT', function () {
  db.quit();
});

// Set up a callback for when the connection is ready
db.on('ready', function () {
  console.log('Connected to Redis');
});

// Export the db object with the flushdb method
module.exports = {
  db,
  flushdb: db.flushdb.bind(db),
};
