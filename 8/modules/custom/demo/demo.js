var demo = new dg.Module(); // Create the module.
dg.modules.demo = demo; // Attach it to DrupalGap.

demo.routing = function() {
  var routes = {};

  // My example page route.
  routes["demo.welcome"] = {
    "path": "/welcome",
    "defaults": {
      "_title": "Welcome to DrupalGap",
      "_controller": function() {

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

          // Send the element back to be rendered on the page.
          ok(element);

        });

      }
    }
  };

  return routes;
};
