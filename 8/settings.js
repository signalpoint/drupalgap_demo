// jDrupal Settings.
jDrupal.settings = {

  // Drupal site settings.
  sitePath: '',
  basePath: '/',

  // Set to true to see debug info printed to the console.log().
  debug: true

};

// Set the demo site path for production and development environments.
jDrupal.settings.sitePath = window.location.toString().indexOf('localhost') == -1 ?
  'http://demo.drupalgap.org/8/drupal' : 'http://localhost/drupalgap.web/8';

// App mode.
dg.settings.mode = 'web-app'; // web-app or phonegap

// App title.
dg.settings.title = 'DrupalGap 8 Demo';

// App front page.
dg.settings.front = 'welcome';

// App logo.
dg.settings.logo = {
  _theme: 'image',
  _path: 'modules/custom/demo/images/drupalgap-wide.jpg'
};

// The active theme.
dg.settings.theme = {
  name: 'ava',
  path: 'themes/ava'
};

// Drupal files directory path(s)
dg.settings.files = {
  publicPath: 'sites/default/files',
  privatePath: null
};

// Blocks.
dg.settings.blocks = {};

// Blocks for the active theme.
dg.settings.blocks[dg.config('theme').name] = {
  header: {

    // DrupalGap's logo block.
    logo: {
      _access: function () { return !demo.headerBlockAccess(); }
    },

    // The demo app's css framework switcher.
    switch_css_framework: {
      _access: function () { return demo.headerBlockAccess(); }
    },

    // DrupalGap's main menu block.
    main_menu: {
      _access: function () { return demo.headerBlockAccess(); }
    },

    // The user login form's block provided by DrupalGap.
    user_login: {
      _access: function () { return demo.headerBlockAccess(); }
    },

    // The user menu provided by DrupalGap.
    user_menu: {
      _roles: [
        { target_id: 'authenticated', visible: true }
      ]
    }

  },
  content: {

    // DrupalGap's page title block.
    title: { },

    // DrupalGap's "main" content block.
    main: { }

  },
  footer: {

    // The powered by DrupalGap block.
    powered_by: {
      _access: function () { return demo.headerBlockAccess(); }
    }

  }
};

dg.settings.google_analytics = {
  id: 'UA-36188740-6'
};
