cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-inappbrowser.inappbrowser",
      "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
      "pluginId": "cordova-plugin-inappbrowser",
      "clobbers": [
        "cordova.InAppBrowser.open",
        "window.open"
      ]
    },
    {
      "id": "cordova-plugin-safariviewcontroller.SafariViewController",
      "file": "plugins/cordova-plugin-safariviewcontroller/www/SafariViewController.js",
      "pluginId": "cordova-plugin-safariviewcontroller",
      "clobbers": [
        "SafariViewController"
      ]
    },
    {
      "id": "com.rjfun.cordova.httpd.CorHttpd",
      "file": "plugins/com.rjfun.cordova.httpd/www/CorHttpd.js",
      "pluginId": "com.rjfun.cordova.httpd",
      "clobbers": [
        "cordova.plugins.CorHttpd"
      ]
    },
    {
      "id": "cordova-plugin-geolocation.geolocation",
      "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
      "pluginId": "cordova-plugin-geolocation",
      "clobbers": [
        "navigator.geolocation"
      ]
    },
    {
      "id": "cordova-plugin-geolocation.PositionError",
      "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
      "pluginId": "cordova-plugin-geolocation",
      "runs": true
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-inappbrowser": "3.2.0",
    "cordova-plugin-safariviewcontroller": "1.6.0",
    "cordova-plugin-whitelist": "1.3.4",
    "com.rjfun.cordova.httpd": "0.9.2",
    "cordova-plugin-geolocation": "4.0.2"
  };
});