const db = require('../dbClient');

module.exports = {
  create: (user, callback) => {
    // Check parameters
    if (!user.username)
      return callback(new Error("Wrong user parameters"), null);
    // Create User schema
    const userObj = {
      firstname: user.firstname,
      lastname: user.lastname,
    };
    // Check if user already exists
    db.hgetall(user.username, function (err, res) {
      if (err) return callback(err, null);
      if (!res) {
        // Save to DB
        db.hmset(user.username, userObj, (err, res) => {
          if (err) return callback(err, null);
          callback(null, res); // Return callback
        });
      } else {
        callback(new Error("User already exists"), null);
      }
    });
  },
  get: (username, callback) => {
    if (!username)
      return callback(new Error("Username must be provided"), null);
    db.hgetall(username, function (err, res) {
      if (err) return callback(err, null);
      if (res) callback(null, res);
      else callback(new Error("User doesn't exist"), null);
    });
  },
  update: (username, updatedData, callback) => {
    if (!username)
      return callback(new Error("Username must be provided"), null);
    // Check if the user exists
    db.hgetall(username, function (err, res) {
      if (err) return callback(err, null);
      if (res) {
        // Update user data
        db.hmset(username, updatedData, (err, res) => {
          if (err) return callback(err, null);
          callback(null, res); // Return callback
        });
      } else {
        callback(new Error("User doesn't exist"), null);
      }
    });
  },
  delete: (username, callback) => {
    if (!username)
      return callback(new Error("Username must be provided"), null);
    // Check if the user exists
    db.hgetall(username, function (err, res) {
      if (err) return callback(err, null);
      if (res) {
        // Delete user
        db.del(username, (err, res) => {
          if (err) return callback(err, null);
          callback(null, res); // Return callback
        });
      } else {
        callback(new Error("User doesn't exist"), null);
      }
    });
  },
};
