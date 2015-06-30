/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  minifyCSS: {
    enabled: false
  },
  minifyJS: {
    enabled: false
  }
});

app.import('bower_components/ember-localstorage-adapter/localstorage_adapter.js');
app.import('vendor/app.js');
app.import('vendor/AdminLTE.css');
app.import('vendor/_all-skins.css');
app.import('vendor/vegas.css');
app.import('vendor/vegas.js');

// app.import('bower_components/moment/moment.js');
// app.import('bower_components/require/build/require.js');
// app.import('bower_components/underscore/underscore.js');

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

module.exports = app.toTree();
