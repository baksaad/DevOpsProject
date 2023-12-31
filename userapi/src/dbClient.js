var redis = require("redis");
const configure = require('./configure')
 
function getEnvWithDefault(key, defaultValue) {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}
 
const config = configure()
 
const redisHost = getEnvWithDefault("REDIS_HOST", "localhost");
const redisPort = getEnvWithDefault("REDIS_PORT", "6379");
const redisPassword = getEnvWithDefault("REDIS_PASSWORD", "");
var db = redis.createClient({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  retry_strategy: function(options) {
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting if the server refuses the connection
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      // End reconnecting after a maximum number of tries
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});
 
process.on('SIGINT', function() {
  db.quit();
});
 
module.exports = db;