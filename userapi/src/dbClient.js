const redis = require("redis");
const configure = require('./configure');

const config = configure();

const db = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // Connection refused, retry after 3 seconds
      console.error('Redis connection refused. Retrying...');
      return 3000;
    }
    if (options.total_retry_time > 1000 * 60 * 5) {
      // Retry for up to 5 minutes
      console.error('Retry time exhausted. Exiting.');
      process.exit(1);
    }
    if (options.attempt > 10) {
      // Max attempts reached, return an error
      console.error('Max attempts reached. Exiting.');
      process.exit(1);
    }
    // Retry with an increasing delay
    return Math.min(options.attempt * 100, 3000);
  },
});

process.on('SIGINT', function () {
  db.quit();
  process.exit();
});

db.on('connect', function () {
  console.log('Connected to Redis');
});

db.on('error', function (err) {
  console.error('Redis connection error:', err);
});

module.exports = db;
