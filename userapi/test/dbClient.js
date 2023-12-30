// Use 'redis' library directly in your dbClient.js
const redis = require("redis");
const configure = require('../src/configure');

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

module.exports = db;
