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
      "_title": "Greetings Map",
      "_controller": function() {
        return new Promise(function(ok, err) {

          // Grab the current user.
          var account = dg.currentUser();

          // Let's build a render element to render on the page...
          var element = {};

          // Google map.
          element['map'] = demo.getMapRenderElement();

          // Add a placeholder for showing messages.
          element['message'] = {
            _markup: '<div id="demo-message"></div>',
            _weight: 2
          };

          // Display a View listing of recent greetings.
          element['article_list'] = dg.recentGreetings();

          // Anonymous users...
          if (!account.isAuthenticated()) {

            // Direct them to the login form so they can use the map.
            element['message']._postRender = [function() {
              var nid = window.localStorage.getItem('demo_message_sent');
              demo.setMessage({
                _theme: 'message',
                _message: dg.t('Login to add a greeting to the map.')
              });
            }];
            ok(element);

          }

          else {

            // Authenticated users...

            // If they've already sent a message, let them know and don't show the form.
            if (window.localStorage.getItem('demo_message_sent')) {
              element['message']._postRender = [function() {
                var nid = window.localStorage.getItem('demo_message_sent');
                demo.setMessage({
                  _theme: 'message',
                  _type: 'warning',
                  _message: dg.t('You already sent a message!') + ' (' + dg.l(dg.t('view message'), 'node/' + nid) + ')'
                });
              }];
              ok(element);
              return;
            }

            // Show a message informing the user how to use the map and form.
            element['message']._postRender = [function() {
              demo.setMessage({
                _theme: 'message',
                _type: 'info',
                _message:
                dg.t('Click on the map and enter your message below...') + ' ' +
                dg.l(dg.t('or use your current location'), null, {
                  _attributes: {
                    href: '',
                    onclick: 'demo.getCurrentLocation(); return false;'
                  }
                })
              });
            }];

            // Load the form, add it to DrupalGap, then attach its html to our render element.
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

      // Show some informative messages to encourage users to try the css framework switcher.
      if (dg.currentUser().isAnonymous() && dg.config('theme').name == 'ava' && (dg.getPath() == 'welcome' || dg.getPath() == '')) {
        form._prefix = dg.theme('message', {
          _type: 'error',
          _message: dg.t('Hmmm, this looks very boring...')
        }) + dg.theme('message', {
          _type: 'warning',
          _message: dg.t('that is because the DrupalGap SDK is totally headless...')
        }) + dg.theme('message', {
          _type: 'status',
          _message:  dg.t('which lets app developers pick their own additional tools, while DrupalGap handles integration with Drupal.')
        }) + '<p>' + dg.t("Try a <em>theme + module</em> extension for DrupalGap:") + '</p>';
      }

      // The framework switcher select list.
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

      // Send the form back to be rendered.
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

      // Add the other form elements.
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
          _value: 'Send message',
          _button_type: 'primary'
        }
      };

      ok(form);

    });
  };

  this.submitForm = function(form, formState) {
    return new Promise(function(ok, err) {

      // Save a new article node to Drupal, hide the form, display an informative message, and refresh the recent
      // greetings listing.
      var node = new dg.Node({
        type: [ { target_id: 'article' } ],
        title: [ { value: formState.getValue('name') } ],
        body:[ { value: formState.getValue('message') } ],
        field_latitude:[ { value: formState.getValue('latitude') } ],
        field_longitude:[ { value: formState.getValue('longitude') } ]
      });
      node.save().then(function() {
        window.localStorage.setItem('demo_message_sent', node.id());
        document.getElementById('demo-say-hello-form').style.display = "none";
        demo.setMessage({
          _theme: 'message',
          _type: 'status',
          _message: dg.t('Message sent!')
        });
        document.getElementById('recent-greetings').innerHTML = dg.render(dg.recentGreetings());
        ok();
      });

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
 * Implements hook_entity_view().
 * @param {Object} element
 * @param {Entity} entity
 */
function demo_entity_view(element, entity) {

  // Add a google map to article nodes, and show a marker at the latitude and longitude stored in the node.
  if (entity.getEntityType() == 'node' && entity.getBundle() == 'article') {

    element['map'] = demo.getMapRenderElement();
    element['map']._postRender.push(function() {

      var articleLatlng = new google.maps.LatLng(
          entity.get('field_latitude', 0).value,
          entity.get('field_longitude', 0).value
      );
      var marker = new google.maps.Marker({
        position: articleLatlng,
        map: demo.map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });
      demo.map.panTo(articleLatlng);
      demo.map.setZoom(7);

    });
  }
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
 * Returns a render element used to display the Google Map.
 * @returns {Object}
 */
demo.getMapRenderElement = function() {
  return {
    _markup: '<div ' + dg.attributes({ id: 'demo-map' }) + '></div>',
    _postRender: [function() {

      // Set the map's default options.
      var mapOptions = {
        //center: new google.maps.LatLng(42.292826, -83.734731), // The Tech Brewery in Ann Arbor, MI - USA
        center: new google.maps.LatLng(0, 0),
        zoom: 3,
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

    }],
    _weight: 1
  }
};

/**
 * Returns a render element for displaying recent greetings.
 */
dg.recentGreetings = function() {
  return {
    _theme: 'view',
    _title: 'Recent greetings',
    _path: 'articles', // Path to the View in Drupal
    _format: 'div',
    _attributes: {
      id: 'recent-greetings'
    },
    _row_callback: function(row) {
      var node = dg.Node(row);
      var d = new Date(node.getCreatedTime() * 1000);
      return '<h4>' + dg.l(node.getTitle(), 'node/' + node.id()) + ' | ' + d.toDateString() + '</h4>' +
          '<blockquote>' + node.get('body', 0).value + '</blockquote>';
    },
    _weight: 3
  };
};

/**
 * Given a render element, this will render it in the message div container.
 * @param element
 */
demo.setMessage = function(element) {
  document.getElementById('demo-message').innerHTML = dg.render(element);
};

/**
 * Removes all markers from the map.
 */
demo.clearMarkers = function() {
  for (var i = 0; i < demo.markersArray.length; i++ ) {
    demo.markersArray[i].setMap(null);
  }
  demo.markersArray.length = 0;
};

/**
 * Given a latitude and longitude, this will set them into the hidden input fields.
 * @param lat
 * @param lng
 */
demo.setCoordinateInputs = function(lat, lng) {
  document.getElementById('edit-latitude').value = lat;
  document.getElementById('edit-longitude').value = lng;
};

/**
 * Tries to get the user's current location and update the map.
 */
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
