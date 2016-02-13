demo.welcomePage = function() {
  return new Promise(function(ok, err) {

    // Grab the current user.
    var account = dg.currentUser();

    // Let's build a render element to render on the page...
    var element = { };

    if (demo.outOfTheBoxAndAnonymous() && !demo.cssFrameworkSwitched()) {
      element.intro = {
        _theme: 'item_list',
        _type: 'ol',
        _items: [
          dg.t('Agree this demo looks boring'),
          dg.t('Know that DrupalGap 8 is an empty canvas for developers'),
          dg.l('Get ready')
        ]
      };
      element.expectations = {
        _theme: 'item_list',
        _title: {
          _markup: '<h3>' + dg.t('What to expect') + '</h3><p>' + dg.t('A simple headless Drupal 8 web application...') + '</p>'
        },
        _items: [
          dg.t("to add a message to a map"),
          dg.t('to browse other messages'),
          dg.t('with a surprise or two')
        ],
        _suffix: dg.l(dg.t('Continue the demo'), 'tour')
      };
    }
    else {
      element.intro = demo.showcase();
      element.start = {
        _theme: 'item_list',
        _title: dg.t('Getting Started'),
        _items: [
          dg.l(dg.t('Hello world'), 'http://docs.drupalgap.org/8/Hello_World'),
          dg.l(dg.t("See the demo's source code"), 'https://github.com/signalpoint/drupalgap_demo/tree/8.x-1.x/8'),

        ]
      };
    }

    ok(element);

  });
};



demo.tourPage = function() {
  return new Promise(function(ok, err) {

    // Grab the current user.
    var account = dg.currentUser();

    // Let's build a render element to render on the page...
    var element = { };

    element.intro = demo.showcase();

    // List out some of DrupalGap's best features and how to get started.
    //if (!demo.outOfTheBoxAndAnonymous()) {
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
      '<blockquote>' + dg.t('the DrupalGap tool set is dedicated to Drupal 8 application development.') + '</blockquote>'
    };
    //}

    ok(element);

  });
};

demo.mapPage = function() {
  return new Promise(function(ok, err) {

    // Grab the current user.
    var account = dg.currentUser();

    // Let's build a render element to render on the page...
    var element = {};

    // Google map.
    element.map = demo.getMapRenderElement();
    element.map._weight = 3;
    element.map._postRender.push(function() {

      // Add click-able markers on the map for recent messages sent, then set the center of the map.
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
        window.setTimeout(function() {
          demo.map.fitBounds(bounds);
        }, 100);
      });

    });

    // Add a placeholder for showing messages.
    element['message'] = {
      _markup: '<div id="demo-message"></div>',
      _weight: 1
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
};

demo.messagesPage = function() {
  return new Promise(function(ok, err) {

    // Display a View listing of recent greetings.
    var element = {};
    element['article_list'] = dg.recentGreetings();
    ok(element);

  });
};
