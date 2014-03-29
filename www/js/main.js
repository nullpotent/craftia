(function() {
  "use strict";
  require.config({
    urlArgs: Math.random(),
    baseUrl: "js",
    paths: {
      "jquery": "../vendor/jquery/dist/jquery.min",
      "handlebars": "../vendor/handlebars/handlebars.min",
      "requireLib": "../vendor/requirejs/require",
      "angular": "../vendor/"
    },
    shim: {
      "jquery": {
        exports: "$"
      },
      "handlebars": {
        exports: "Handlebars"
      }
    }
  });

  require(["handlebars", "jquery"], function(Handlebars, $) {
    return alert("Ovo samo da vidim dal se js izvrsava");
  });

}).call(this);
