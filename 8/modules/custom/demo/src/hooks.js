/**
 * Implements hook_form_alter().
 */
function demo_form_alter(form, form_state, form_id) {
  return new Promise(function(ok, err) {
    if (form.actions) { form.actions._weight = 999; }
    if (form_id == 'UserLoginForm') {
      form.name._value = 'demo';
      form.pass._value = 'drupalgap2012';
    }
    ok();
  });
}

/**
 * Implements hook_regions_build_alter().
 */
function demo_blocks_build_alter(blocks) {
  // Add a css class to the resources block container.
  if (blocks.resources) {
    blocks.resources._attributes['class'].push('columns');
  }
}

/**
 * Implements hook_block_view_alter().
 */
function demo_block_view_alter(element, block) {

  // Inspect the element and block to reveal who and what to alter.
  //console.log(element);
  //console.log(block);

  switch (block.get('id')) {


    case 'main_menu':

      // If it's bootstrap, we can drop the "Home" link (we actually clear the whole menu here, so careful).
      if (dg.config('theme').name == 'burrito') { element.menu._items = []; }

      // Build links for the app's main menu.
      element.menu._items.push(
          dg.l(dg.t('Map'), 'map'),
          dg.l(dg.t('Messages'), 'messages'),
          dg.l(dg.t('Tour'), 'tour')
      );

      break;

  }

}

/**
 * Implements hook_entity_view().
 * @param {Object} element
 * @param {Entity} entity
 */
function demo_entity_view(element, entity) {

  // On article nodes...
  if (entity.getEntityType() == 'node' && entity.getBundle() == 'article') {

    var account = dg.currentUser();

    // Add a node edit link for authenticated users, style it appropriately for the css framework.
    if (account.isAuthenticated()) {
      var containerAttrs = { };
      var editAttrs = {};
      if (demo.isBootstrap()) {
        containerAttrs = { 'class': ['text-right'] };
        editAttrs = { 'class': ['btn', 'btn-sm', 'btn-success'] };
      }
      else if (demo.isFoundation()) {
        containerAttrs = { 'class': ['float-right'] };
        editAttrs = { 'class': ['button', 'success'] };
      }
      element['controls'] = {
        _theme: 'container',
        _attributes: containerAttrs,
        _children: {
          _edit: {
            _markup: dg.l(dg.t('Edit'), 'node/' + entity.id() + '/edit', {
              _attributes: editAttrs
            })
          }
        }
      };
    }

    // Add a google map to article nodes, and show a marker at the latitude and longitude stored in the node.
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
