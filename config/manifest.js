'use strict';

module.exports = function (/* environment, appConfig */) {
  // See https://github.com/zonkyio/ember-web-app#documentation for a list of
  // supported properties

  return {
    gcm_sender_id: '103953800507',
    name: "web",
    short_name: "web",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [],
    ms: {
      tileColor: '#fff'
    }
  };
}
