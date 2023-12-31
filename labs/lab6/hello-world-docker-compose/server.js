'use strict';

const express = require('express');
const redis = require('redis');
const PORT = 8080;

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

function get_hit_count(callback) {
  client.get('hits', (err, count) => {
    if (err) {
      console.error(err);
      return callback(0);
    }
    callback(count);
  });
}

const app = express();

app.get('/', (req, res) => {
  get_hit_count((count) => {
    count = parseInt(count) + 1;
    client.set('hits', count, (err) => {
      if (err) {
        console.error(err);
      }
      res.send('Hello World from Docker! I have been seen ' + count + ' times');
    });
  });
});

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);
