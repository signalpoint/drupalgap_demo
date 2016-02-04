// jDrupal Settings.
jDrupal.settings = {

  // Drupal site settings.
  sitePath: '',
  basePath: '/',

  // Set to true to see debug info printed to the console.log().
  debug: true

};

// Set the demo Drupal 8 site path dynamically.
jDrupal.settings.sitePath = window.location.toString().indexOf('localhost') == -1 ?
  'http://demo.drupalgap.org/8/drupal' : 'http://localhost/drupalgap.web/8';

// DrupalGap Settings.
dg.settings = {
  front: 'welcome', // The front page
  mode: 'web-app', // The app mode, web-app or phonegap
  title: 'DrupalGap'
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

    // DrupalGap's main menu block.
    main_menu: { },

    // The user login form provided by DrupalGap.
    user_login: { },

    // The demo app's css framework switcher.
    switch_css_framework: { }

  },
  content: {

    // DrupalGap's page title block.
    title: { },

    // DrupalGap's "main" content block.
    main: { }

  },
  footer: {

    // The powered by DrupalGap block.
    powered_by: { }

  }
};
