// Generated by CoffeeScript 1.7.1
(function() {
  var wrench;

  wrench = require("wrench");

  module.exports = function(app, passport) {
    return wrench.readdirSyncRecursive("./src/backend/controllers").filter(function(cntrl) {
      return cntrl.endsWith(".coffee");
    }).forEach(function(cntl) {
      return require("./controllers/" + cntl).setup(app);
    });
  };

}).call(this);