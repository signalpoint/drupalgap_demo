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

  // My example page route.
  routes["demo.welcome"] = {
    "path": "/welcome",
    "defaults": {
      "_title": "DrupalGap 8 Demo",
      "_controller": function() {
        return new Promise(function(ok, err) {

          // Grab the current user.
          var account = dg.currentUser();

          // Let's build a render element to render on the page...
          var element = {};

          // Show info about CSS Framework(s).
          //var msg = '';
          //switch (dg.config('theme').name) {
          //  case 'ava': // The core, out of the box theme.
          //    msg = 'Welcome to the DrupalGap out of the box demo.';
          //    break;
          //  case 'burrito': // The core theme for Bootstrap.
          //    msg = 'With a module for DrupalGap 8, instantly switch to a Bootstrap front end.';
          //    break;
          //  case 'frank': // The core theme for Foundation.
          //    msg = 'Instantly switch to a Foundation front end, with a module for DrupalGap 8.';
          //    break;
          //}
          //element.css = { _markup: '<blockquote>' + msg + '</blockquote>' };

          // Google map.
          element['map'] = {
            _markup: '<div ' + dg.attributes({ id: 'demo-map' }) + '></div>',
            _postRender: [demo_map_post_render],
            _weight: 1
          };

          element['article_list'] = {
            _theme: 'view',
            _title: 'Recent greetings',
            _path: 'articles', // Path to the View in Drupal
            _format: 'ul',
            _row_callback: function(row) {
              var node = dg.Node(row);
              return dg.l(node.getTitle(), 'node/' + node.id());
            },
            _weight: 3
          };

          // Anonymous users...
          if (!account.isAuthenticated()) {


            element['add_article'] = {
              _theme: 'link',
              _text: 'Add a drop to the map',
              _path: 'user/login'
            };

            // Send the element back to be rendered on the page.
            ok(element);

          }

          else {

            // Authenticated users...

            // Load the form, add it to DrupalGap, then attach its html to our render element, then send the element
            // back to be rendered on the page.
            dg.addForm('DemoSayHelloForm', dg.applyToConstructor(DemoSayHelloForm)).getForm().then(function(formHTML) {
              element['say_hello_form'] = {
                _markup: formHTML,
                _weight: 2
              };
              ok(element);
            });

          }

        });
      }
    }
  };

  return routes;
};

/**
 * FORMS
 */

/**
 * The form for switching between the different css framework demos.
 * @constructor
 */
var DemoSwitchForm = function() {

  this.buildForm = function(form, formState) {
    return new Promise(function(ok, err) {
      form.css_frameworks = {
        _type: 'select',
        _title: 'Switch CSS Framework',
        _options: {
          out_of_the_box: dg.t('Out of the box'),
          bootstrap: dg.t('Bootstrap'),
          foundation: dg.t('Foundation')
        },
        _value: demo.currentFramework(),
        _attributes: {
          onchange: "demo.switchFramework(this)"
        }
      };
      ok(form);
    });
  };

};
// Extend the DrupalGap form prototype and attach our form's constructor.
DemoSwitchForm.prototype = new dg.Form('DemoSwitchForm');
DemoSwitchForm.constructor = DemoSwitchForm;

/**
 * My form's constructor.
 */
var DemoSayHelloForm = function() {

  this.buildForm = function(form, formState) {
    return new Promise(function(ok, err) {
      form._prefix = '<h3>' + dg.t('Add a drop to the map') + '</h3>' +
          dg.l('Use current location', null, { _attributes: { onclick: 'demo.getCurrentLocation()' } });
      form.name = {
        _type: 'textfield',
        _title: 'Name',
        _required: true,
        _title_placeholder: true
      };
      form.message = {
        _type: 'textarea',
        _title: 'Message',
        _required: true,
        _title_placeholder: true
      };

      form.latitude = {
        _type: 'hidden',
        _title: 'Latitude',
        _required: true,
        _title_placeholder: true
      };
      form.longitude = {
        _type: 'hidden',
        _title: 'Longitude',
        _required: true,
        _title_placeholder: true
      };
      form.actions = {
        _type: 'actions',
        submit: {
          _type: 'submit',
          _value: 'Save drop',
          _button_type: 'primary'
        }
      };
      ok(form);
    });
  };

  this.submitForm = function(form, formState) {
    return new Promise(function(ok, err) {
      var msg = 'Hello ' + formState.getValue('name');
      dg.alert(msg);
      ok();
    });
  };

};
// Extend the DrupalGap form prototype and attach my form's constructor.
DemoSayHelloForm.prototype = new dg.Form('DemoSayHelloForm');
DemoSayHelloForm.constructor = DemoSayHelloForm;

/**
 * BLOCKS
 */

/**
 * Defines blocks for demo.
 */
demo.blocks = function() {
  var blocks = {};

  blocks['switch_css_framework'] = {
    build: function () {
      return new Promise(function(ok, err) {

        // Load the form, add it to DrupalGap, render it and then return it.
        dg.addForm('DemoSwitchForm', dg.applyToConstructor(DemoSwitchForm)).getForm().then(ok);

      });
    }
  };

  return blocks;
};

/**
 * HOOKS
 */

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
      //element.menu._items.push(
      //    dg.l('Map', 'map')
      //);
      break;

  }

}

/**
 * Implements hook_form_alter().
 */
function demo_form_alter(form, form_state, form_id) {
  return new Promise(function(ok, err) {
    if (form_id == 'UserLoginForm') {
      form.name._value = 'demo';
      form.pass._value = 'drupalgap2012';
    }
    ok();
  });
}

/**
 * HELPERS
 */

/**
 * Returns the current css framework.
 * @returns {String}
 */
demo.currentFramework = function() {
  var select = document.getElementById('edit-css-frameworks');
  if (select) { return select.value; }
  switch (dg.config('theme').name) {
    case 'ava': return 'out_of_the_box'; break;
    case 'burrito': return 'bootstrap'; break;
    case 'frank': return 'foundation'; break;
  }
};

/**
 * Handles the switching of the app's CSS framework.
 */
demo.switchFramework = function(select) {
  var current = window.location.toString();
  switch (select.value) {
    case 'out_of_the_box':
      if (current.indexOf('foundation') != -1) {
        current = current.replace('foundation/', '');
      }
      else if (current.indexOf('bootstrap') != -1) {
        current = current.replace('bootstrap/', '');
      }
      break;
    case 'bootstrap':
      if (current.indexOf('foundation') != -1) {
        current = current.replace('foundation', 'bootstrap');
      }
      else {
        current = current.replace('8/', '8/bootstrap');
      }
      break;
    case 'foundation':
      if (current.indexOf('bootstrap') != -1) {
        current = current.replace('bootstrap', 'foundation');
      }
      else {
        current = current.replace('8/', '8/foundation');
      }
      break;
  }
  window.location = current;
};

/**
 * The map post render.
 */
function demo_map_post_render() {

  // Set the map's default options.
  var mapOptions = {
    //center: new google.maps.LatLng(42.292826, -83.734731), // The Tech Brewery in Ann Arbor, MI - USA
    center: new google.maps.LatLng(0, 0),
    zoom: 2,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
    scrollwheel: false
  };

  // Initialize the map, set its click listener for markers, and set a timeout to resize properly.
  demo.markersArray = [];
  demo.map = new google.maps.Map(
      document.getElementById("demo-map"),
      mapOptions
  );
  google.maps.event.addListener(demo.map, 'click', function (event) {
    demo.clearMarkers();
    demo.setCoordinateInputs(event.latLng.lat(), event.latLng.lng());
    var marker = new google.maps.Marker({
      position: event.latLng,
      map: demo.map
    });
    demo.markersArray.push(marker);
  });
  setTimeout(function() {
    google.maps.event.trigger(demo.map, 'resize');
  }, 500);

}

demo.clearMarkers = function() {
  for (var i = 0; i < demo.markersArray.length; i++ ) {
    demo.markersArray[i].setMap(null);
  }
  demo.markersArray.length = 0;
};

demo.setCoordinateInputs = function(lat, lng) {
  document.getElementById('edit-latitude').value = lat;
  document.getElementById('edit-longitude').value = lng;
};

demo.getCurrentLocation = function() {
  navigator.geolocation.getCurrentPosition(

      // Success.
      function(position) {

        // Set aside the user's position and place it in the hidden form inputs.
        demo.userLatitude = position.coords.latitude;
        demo.userLongitude = position.coords.longitude;
        demo.setCoordinateInputs(demo.userLatitude, demo.userLongitude);

        // Build the lat lng object from the user's position.
        var myLatlng = new google.maps.LatLng(
            demo.userLatitude,
            demo.userLongitude
        );

        // Add a marker for the user's current position, pan to it and zoom in.
        demo.clearMarkers();
        var marker = new google.maps.Marker({
          position: myLatlng,
          map: demo.map,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        demo.markersArray.push(marker);
        demo.map.panTo(myLatlng);
        demo.map.setZoom(11);

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
};
