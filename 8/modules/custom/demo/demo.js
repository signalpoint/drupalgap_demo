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

  /**
   * THE WELCOME PAGE
   */

  // The demo welcome page.
  routes["demo.welcome"] = {
    "path": "/welcome",
    "defaults": {
      "_title": "Welcome",
      "_controller": function() {
        return new Promise(function(ok, err) {

          // Grab the current user.
          var account = dg.currentUser();

          // Let's build a render element to render on the page...
          var element = { };

          switch (dg.config('theme').name) {

            // "Out of the box" theme.
            case 'ava':
                if (account.isAnonymous()) {
                  element.intro = {
                    _theme: 'item_list',
                    _type: 'ol',
                    _items: [
                      dg.t('Acknowledge how boring this looks'),
                      dg.t('Realize DrupalGap is an empty canvas for app developers'),
                      dg.t('Get "out of the box" to explore the tool set and extensions')
                    ]
                  };
                }
                else {
                  var msg = dg.t('To support other CSS Frameworks (or no framework at all), the DrupalGap front end is very flexible.');
                  element.intro = { _markup: '<blockquote>' + msg + '</blockquote>' };
                }

              break;

            // Core theme for Bootstrap.
            case 'burrito':
              var msg = dg.t('Instantly add a _bootstrap front end to your app with a _module extension for DrupalGap.', {
                _bootstrap: dg.l(dg.t('Bootstrap'), 'http://getbootstrap.com/'),
                _module: dg.l(dg.t('module'), 'http://drupalgap.org/project/bootstrap')
              });
              element.intro = { _markup: '<blockquote>' + msg + '</blockquote>' };
              break;

            // Core theme for Foundation.
            case 'frank':
              var msg = dg.t('Instantly add a _foundation front end to your app with a _module extension for DrupalGap.', {
                _foundation: dg.l(dg.t('Foundation'), 'http://foundation.zurb.com/'),
                _module: dg.l(dg.t('module'), 'http://drupalgap.org/project/foundation')
              });
              element.intro = { _markup: '<blockquote>' + msg + '</blockquote>' };
              break;

          }

          // List out some of DrupalGap's best features and how to get started.
          if (dg.config('theme').name != 'ava' || account.isAuthenticated()) {

            element.features = {
              _markup:

                '<h2>' + dg.t('Tools and Features') + '</h2>' +
                '<blockquote>' + dg.t('By utilizing familiar coding syntax and concepts from Drupal 8 such as...') + '</blockquote>' +
                dg.theme('item_list', {
                  _items: [
                    dg.t('Entities / Fields'),
                    dg.t('Modules'),
                    dg.t('Hooks'),
                    dg.t('Themes'),
                    dg.t('Regions'),
                    dg.t('Blocks'),
                    dg.t('Templates'),
                    dg.t('Routes / Custom Pages'),
                    dg.t('Forms API'),
                    dg.t('User Roles / Permissions')
                  ]
                }) +
              '<blockquote>' + dg.t('with built in pages, widgets and forms to handle...') + '</blockquote>' +
              dg.theme('item_list', {
                _items: [
                  dg.t('User Authentication'),
                  dg.t('Adding / Editing Entities'),
                  dg.t('Displaying Entities / Fields'),
                  dg.t('Rendering Views Result Data')
                ]
              }) +
              '<blockquote>' + dg.t('the DrupalGap tool set is dedicated to Drupal 8 application development.') + '</blockquote>' +

              '<h2>' + dg.t('Continuing the Demo') + '</h2>' +
              '<blockquote>' + dg.t('Be sure to say hello on the _map and browse the _messages list.', {
                  _map: dg.l(dg.t('map'), 'map'),
                  _messages: dg.l(dg.t('messages'), 'messages')
                }) + '</blockquote>' +

              '<h2>' + dg.t('Getting Started') + '</h2>' +
              '<blockquote>' + dg.t('Try the _helloWorld World for DrupalGap.', {
                _helloWorld: dg.l(dg.t('Hello World'), 'http://docs.drupalgap.org/8/Hello_World')
              }) + '</blockquote>'
            };

          }

          ok(element);

        });
      }
    }
  };

  /**
   * THE MAP PAGE
   */

  // My map page route.
  routes["demo.map"] = {
    "path": "/map",
    "defaults": {
      "_title": "Map",
      "_controller": function() {
        return new Promise(function(ok, err) {

          // Grab the current user.
          var account = dg.currentUser();

          // Let's build a render element to render on the page...
          var element = {};

          // Google map.
          element.map = demo.getMapRenderElement();
          element.map._postRender.push(function() {

            // Add clickable markers on the map for recent messages sent, then set the center of the map.
            jDrupal.viewsLoad('articles').then(function(view) {
              var results = view.getResults();
              var markers = [];
              for (var i = 0; i < results.length; i ++) {
                var node = new jDrupal.Node(results[i]);
                var marker = new google.maps.Marker({
                  position: new google.maps.LatLng(
                    node.get('field_latitude', 0).value,
                    node.get('field_longitude', 0).value
                  ),
                  map: demo.map,
                  icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                });
                markers.push(marker);
                var content = dg.l(node.getTitle(), 'node/' + node.id());
                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow) {
                  return function() {
                    infowindow.setContent(content);
                    infowindow.open(demo.map, marker);
                  };
                })(marker, content, infowindow));
              }
              var bounds = new google.maps.LatLngBounds();
              for (var i = 0; i < markers.length; i++) { bounds.extend(markers[i].getPosition()); }
              demo.map.fitBounds(bounds);
            });

          });

          // Add a placeholder for showing messages.
          element['message'] = {
            _markup: '<div id="demo-message"></div>',
            _weight: 2
          };

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

  /**
   * THE MESSAGES PAGE
   */

  // My messages page route.
  routes["demo.messages"] = {
    "path": "/messages",
    "defaults": {
      "_title": "Messages",
      "_controller": function() {
        return new Promise(function(ok, err) {

          // Grab the current user.
          var account = dg.currentUser();

          // Let's build a render element to render on the page...
          var element = {};

          // Display a View listing of recent greetings.
          element['article_list'] = dg.recentGreetings();

          // Anonymous users...
          if (!account.isAuthenticated()) {

          }

          else {

            // Authenticated users...

          }

          ok(element);

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
      element.menu._items.push(
          dg.l(dg.t('Map'), 'map'),
          dg.l(dg.t('Messages'), 'messages')
      );
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

  // Display "member since" info on user profiles until DrupalGap core provides it.
  else if (entity.getEntityType() == 'user' ) {
    var created = new Date(entity.get('created', 0).value * 1000);
    element['member_for'] = {
      _theme: 'container',
      _children: {
        date: {
          _markup: '<h4>' + dg.t('Member since') + '</h4>' + created.toDateString()
        }
      }
    };
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
 * Returns a render element used to display a Google Map.
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
 * Returns a View render element for displaying recent greetings.
 */
dg.recentGreetings = function() {
  return {
    _theme: 'view',
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
