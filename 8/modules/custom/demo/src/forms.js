/**
 * The form for switching between the different css framework demos.
 */
var DemoSwitchForm = function() {

  this.buildForm = function(form, formState) {
    return new Promise(function(ok, err) {

      if (demo.outOfTheBox) { form._attributes.class.push('out-of-the-box'); }

      // The framework switcher select list.
      form.css_frameworks = {
        _type: 'select',
        _options: {
          out_of_the_box: dg.t('Default (out of the box)'),
          bootstrap: dg.t('Bootstrap'),
          foundation: dg.t('Foundation')
        },
        _value: demo.currentFramework(),
        _attributes: {
          onchange: "demo.switchFramework(this)"
        }
      };
      if (demo.outOfTheBox()) { form.css_frameworks._title = dg.t('Theme'); }

      // Add a css class when out of the box.
      if (demo.outOfTheBox()) {
        form.css_frameworks._attributes.class = ['out-of-the-box'];
      }

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
          _value: 'Add message',
          _button_type: 'primary'
        }
      };

      form._suffix = {
        _theme: 'message',
        _type: 'info',
        _message: dg.t('Click on the map to set a position _geo.', {
          _geo: dg.l(dg.t('or use your current location'), null, {
            _attributes: {
              href: '',
              onclick: 'demo.getCurrentLocation(); return false;'
            }
          }
        )})
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
