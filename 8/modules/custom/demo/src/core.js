var demo = new dg.Module(); // Create the module.
dg.modules.demo = demo; // Attach it to DrupalGap.

/**
 * GLOBALS
 */

// Create global variables to hold coordinates and the map.
demo.userLatitude = null;
demo.userLongitude = null;
demo.map = null;

/**
 * ROUTES
 */

/**
 * Provides page routes to DrupalGap.
 * @returns {Object}
 */
demo.routing = function() {
  var routes = {};

  // Welcome page route.
  routes["demo.welcome"] = {
    "path": "/welcome",
    "defaults": {
      "_title": "Welcome",
      "_controller": demo.welcomePage
    }
  };

  // Home page route.
  routes["demo.tour"] = {
    "path": "/tour",
    "defaults": {
      "_title": "Tour",
      "_controller": demo.tourPage
    }
  };

  // Map page route.
  routes["demo.map"] = {
    "path": "/map",
    "defaults": {
      "_title": "Map",
      "_controller": demo.mapPage
    }
  };

  // Messages page route.
  routes["demo.messages"] = {
    "path": "/messages",
    "defaults": {
      "_title": "Messages",
      "_controller": demo.messagesPage
    }
  };

  return routes;
};
