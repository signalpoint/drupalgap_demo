var demo = new dg.Module(); // Create the module.
dg.modules.demo = demo; // Attach it to DrupalGap.

// Create global variables to hold coordinates and the map.
demo.userLatitude = null;
demo.userLongitude = null;
demo.map = null;

/**
 * Provides page routes to DrupalGap.
 * @returns {Object}
 */
demo.routing = function() {
  var routes = {};

  // My example page route.
  routes["demo.welcome"] = {
    "path": "/welcome",
    "defaults": {
      "_title": "DrupalGap 8 Demo",
      "_controller": function() {

        return new Promise(function(ok, err) {

          var element = {};

          // Show info about CSS Framework(s).
          var msg = '';
          switch (dg.config('theme').name) {
            case 'ava': // The core, out of the box theme.
                msg = 'Welcome to the DrupalGap out of the box demo.';
              break;
            case 'burrito': // The core theme for Bootstrap.
              msg = 'With a module for DrupalGap 8, instantly switch to a Bootstrap front end.';
              break;
            case 'frank': // The core theme for Foundation.
              msg = 'Instantly switch to a Foundation front end, with a module for DrupalGap 8.';
              break;
          }
          element.css = {
            _markup: '<blockquote>' + msg + '</blockquote>'
          };

          // Send the element back to be rendered on the page.
          ok(element);

        });

      }
    }
  };

  // My example page route.
  routes["demo.map"] = {
    "path": "/map",
    "defaults": {
      "_title": "Map",
      "_controller": demo_map
    }
  };

  return routes;
};

/**
 * Defines blocks for demo.
 */
demo.blocks = function() {
  var blocks = {};

  blocks['switch_css_framework'] = {
    build: function () {
      return new Promise(function(ok, err) {
        var element = {};

        // Make some links to switch between the different themes.
        var url = window.location.toString();
        var linkPrefix = url.indexOf('localhost') != -1 ?
            'http://localhost/drupalgap.web/demo/8' : 'http://demo.drupalgap.org/8';
        element.themes = {
          _theme: 'item_list',
          _title: 'Switch CSS Framework',
          _items: [{
            _theme: 'link',
            _text: 'Out of the box',
            _path: linkPrefix,
            _attributes: {
              'class': [dg.config('theme').name == 'ava' ? 'active' : '']
            }
          },{
            _theme: 'link',
            _text: 'Bootstrap',
            _path: linkPrefix + '/bootstrap',
            _attributes: {
              'class': [dg.config('theme').name == 'burrito' ? 'active' : '']
            }
          }, {
            _theme: 'link',
            _text: 'Foundation',
            _path: linkPrefix + '/foundation',
            _attributes: {
              'class': [dg.config('theme').name == 'frank' ? 'active' : '']
            }
          }]
        };

        ok(element);
      });
    }
  };

  return blocks;
};

/**
 * Implements hook_block_view_alter().
 */
function demo_block_view_alter(element, block) {

  // Inspect the element and block to reveal who and what to alter.
  //console.log(element);
  //console.log(block);

  switch (block.get('id')) {

    // Add a link to the main menu.
    case 'main_menu':
      element.menu._items.push(
          dg.l('Map', 'map')
      );
      break;

    // Make the powered by block's text red and add a custom class to it.
    case 'powered_by':
      element.list._attributes.style = 'color: red;';
      element.list._attributes['class'].push('foo');
      break;

  }

}


/**
 * The map page controller.
 */
function demo_map() {
  return new Promise(function(ok, err) {

    var content = {};
    var map_attributes = {
      id: 'my-module-map',
      style: 'width: 100%; height: 320px;'
    };
    content['map'] = {
      _markup: '<div ' + dg.attributes(map_attributes) + '></div>',
      _postRender: [demo_map_post_render]
    };
    ok(content);

  });
}

/**
 * The map post render.
 */
function demo_map_post_render() {
  navigator.geolocation.getCurrentPosition(

      // Success.
      function(position) {

        console.log(position);

        // Set aside the user's position.
        demo.userLatitude = position.coords.latitude;
        demo.userLongitude = position.coords.longitude;

        // Build the lat lng object from the user's position.
        var myLatlng = new google.maps.LatLng(
            demo.userLatitude,
            demo.userLongitude
        );

        // Set the map's options.
        var mapOptions = {
          center: myLatlng,
          zoom: 11,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          zoomControl: true,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        };

        // Initialize the map, and set a timeout to resize properly.
        demo.map = new google.maps.Map(
            document.getElementById("my-module-map"),
            mapOptions
        );
        setTimeout(function() {
          google.maps.event.trigger(demo.map, 'resize');
          demo.map.setCenter(myLatlng);
        }, 500);

        // Add a marker for the user's current position.
        var marker = new google.maps.Marker({
          position: myLatlng,
          map: demo.map,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

      },

      // Error
      function(error) {

        // Provide debug information to developer and user.
        console.log(error);
        dg.alert(error.message);

        // Process error code.
        switch (error.code) {

          // PERMISSION_DENIED
          case 1:
            break;

          // POSITION_UNAVAILABLE
          case 2:
            break;

          // TIMEOUT
          case 3:
            break;

        }

      },

      // Options
      { enableHighAccuracy: true }

  );
}
