// All other settings are configured in ../settings.js

// The active theme.
dg.settings.theme = {
  name: 'frank',
  path: 'themes/frank'
};

// Copy the blocks from the ava theme.
dg.settings.blocks[dg.config('theme').name] = dg.settings.blocks.ava;
