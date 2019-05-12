'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    sassOptions: {
      extension: 'scss'
    },
    fingerprint: {
      enabled: true,
      generateAssetMap: true
    }
    // nodeModulesToVendor: [
    //   'node_modules/ntp-time-sync/dist/index.js'
    // ]
  });
  app.import('node_modules/bootstrap/dist/css/bootstrap.css');
  app.import('node_modules/bootstrap/dist/css/bootstrap-theme.css');
  app.import('vendor/js/jquery.sticky.js');
  app.import('vendor/css/jquery.timepicker.min.css');
  app.import('vendor/js/jquery.timepicker.min.js');
  app.import('vendor/js/datepair.js');
  app.import('vendor/js/jquery.datepair.js');
  app.import('vendor/js/geofire.js');
  app.import('vendor/js/dotdotdot.js');
  // app.import('vendor/js/bootstrap-datetimepicker.min.js');
  //app.import('vendor/css/bootstrap-datetimepicker.min.css');

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
