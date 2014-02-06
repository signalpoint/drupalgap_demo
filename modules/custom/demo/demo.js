/**
 * Implements hook_install().
 */
/*function demo_install() {
  try {
  }
  catch (error) { console.log('demo_install - ' + error); }
}*/

/**
 * Implements hook_form_alter().
 */
function demo_form_alter(form, form_state) {
  try {
    if (form.id == 'user_login_form') {
      form.elements.name.default_value = 'demo';
      form.elements.pass.default_value = 'd3m0drup41g4p';
    }
  }
  catch (error) { console.log('demo_form_alter - ' + error); }
}

