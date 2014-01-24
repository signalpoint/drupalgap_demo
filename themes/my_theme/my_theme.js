/**
 * Implements DrupalGap's template_info() hook.
 */
function my_theme_info() {

  // Init an empty theme object.
  var theme = {};
  
  // Set the theme's machine name.
  theme.name = 'my_theme';
  
  // Init the theme's regions.
  theme.regions = {};
  
  // Header region.
  theme.regions['header'] = {
    attributes: {
      'data-role': 'header'
    }
  };
  
  // Navigation region.
  theme.regions['navigation'] = {
    attributes: {
      'data-role': 'navbar'
    }
  };
  
  // Content Region
  theme.regions['content'] = {
    attributes: {
      'data-role': 'content'
    }
  };
  
  // Footer region.
  theme.regions['footer'] = {
    attributes: {
      'data-role': 'footer'
    }
  };
  
  // Return the assembled theme.
  return theme;
}

