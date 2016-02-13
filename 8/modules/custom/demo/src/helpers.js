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
  window.localStorage.setItem('demo_css_framework_switched', 1);
  var current = window.location.toString();
  switch (select.value) {
    case 'out_of_the_box':
      if (current.indexOf('foundation') != -1) { current = current.replace('foundation/', ''); }
      else if (current.indexOf('bootstrap') != -1) { current = current.replace('bootstrap/', ''); }
      break;
    case 'bootstrap':
      if (current.indexOf('foundation') != -1) { current = current.replace('foundation', 'bootstrap'); }
      else { current = current.replace('8/', '8/bootstrap'); }
      break;
    case 'foundation':
      if (current.indexOf('bootstrap') != -1) { current = current.replace('bootstrap', 'foundation'); }
      else { current = current.replace('8/', '8/foundation'); }
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
 * Returns a View render element for displaying recent greetings (messages).
 */
dg.recentGreetings = function() {
  return {
    _theme: 'view',
    _path: 'articles', // Path to the View in Drupal
    _format: 'div',
    _weight: 3,
    _attributes: {
      id: 'recent-greetings'
    },
    _row_callback: function(row) {



      // Prepare the node from the row result.
      var node = dg.Node(row);

      // Grab the date the message was created.
      var d = new Date(node.getCreatedTime() * 1000);

      // Build a link to the node.
      var link = dg.l(node.getTitle(), 'node/' + node.id());

      // Build a header.
      var html = '<h4>' + link + ' | ' + d.toDateString() + '</h4>';

      // If the user is authenticated (aka the demo user), give them a node edit link.
      if (dg.currentUser().isAuthenticated()) {
        var linkOptions = { _attributes: { } };
        var linkClasses = null;
        if (demo.isBootstrap()) {
          linkClasses = ['btn', 'btn-small', 'btn-default', 'pull-right'];
        }
        else if (demo.isFoundation()) {
          linkClasses = ['secondary', 'hollow', 'button', 'float-right'];
        }
        if (linkClasses) { linkOptions._attributes.class = linkClasses; }
        html += dg.l('edit', 'node/' + node.id() + '/edit', linkOptions);
      }

      // Add the body of the message to output.
      html += '<blockquote>' + node.get('body', 0).value + '</blockquote>';

      return html;

    }
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

/**
 * Returns true if the user has switched the css framework, false otherwise.
 */
demo.cssFrameworkSwitched = function() { return window.localStorage.getItem('demo_css_framework_switched'); };

demo.showcase = function() {
  var msg = null;
  switch (dg.config('theme').name) {
    case 'burrito': // bootstrap
      msg = dg.t('Instantly add a _bootstrap front end to your app with a _module extension and theme for DrupalGap.', {
        _bootstrap: dg.l(dg.t('Bootstrap'), 'http://getbootstrap.com/'),
        _module: dg.l(dg.t('module'), 'http://drupalgap.org/project/bootstrap')
      });
      break;
    case 'frank': // foundation
      msg = dg.t('Instantly add a _foundation front end to your app with a _module extension and theme for DrupalGap.', {
        _foundation: dg.l(dg.t('Foundation'), 'http://foundation.zurb.com/'),
        _module: dg.l(dg.t('module'), 'http://drupalgap.org/project/foundation')
      });
      break;
    default: // out of the box
      break;
  }
  if (msg) { return { _markup: '<blockquote>' + msg + '</blockquote>' }; }
  return '';
};

demo.headerBlockAccess = function () {
  return !(
    demo.outOfTheBox() &&
    dg.currentUser().isAnonymous() &&
    dg.isFrontPage() &&
    !demo.cssFrameworkSwitched()
  );
};

demo.outOfTheBox = function() { return dg.config('theme').name == 'ava'; };
demo.isBootstrap = function() { return dg.config('theme').name == 'burrito'; };
demo.isFoundation = function() { return dg.config('theme').name == 'frank'; };
demo.outOfTheBoxAndAnonymous = function() { return demo.outOfTheBox() && dg.currentUser().isAnonymous(); };
