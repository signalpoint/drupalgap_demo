/**
 * Defines blocks for demo.
 */
demo.blocks = function() {
  var blocks = {};

  blocks['switch_css_framework'] = {
    build: function () {
      return new Promise(function(ok, err) {

        // Load the form, add it to DrupalGap, render it and then return it. If they haven't yet switched the css
        // framework, draw attention to it.
        dg.addForm('DemoSwitchForm', dg.applyToConstructor(DemoSwitchForm)).getForm().then(function(formHtml) {
          var element = {};
          if (!demo.cssFrameworkSwitched() && demo.outOfTheBox()) {
            element.msg = {
              _theme: 'message',
              _type: 'warning',
              _message: dg.t('Hey, try switching the mode!')
            };
          }
          element.form = { _markup: formHtml };
          ok(element);
        });

      });
    }
  };

  return blocks;
};