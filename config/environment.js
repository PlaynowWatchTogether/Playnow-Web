'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'web',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    'ember-cli-lightbox': {
      lightboxOptions: {
        alwaysShowNavOnTouchDevices: false,
        albumLabel: "Image %1 of %2",
        disableScrolling: false,
        fadeDuration: 500,
        fitImagesInViewport: true,
        maxWidth: 1000,
        maxHeight: 1000,
        positionFromTop: 50,
        resizeDuration: 700,

        showImageNumberLabel: true
      }
    },
    firebase: {
      apiKey: "AIzaSyB2wa-7D0HZTsSwFNXkUSWs7o-kGl0ku-0",
      authDomain: "goldenfingers1-b95ba.firebaseapp.com",
      databaseURL: "https://playnow-test.firebaseio.com",
      projectId: "goldenfingers1-b95ba",
      storageBucket: "goldenfingers1-b95ba.appspot.com",
      messagingSenderId: "491254045283"
    }
  };
  ENV.googleAnalytics = {
    webPropertyId: 'UA-137856845-1'
  };
  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
