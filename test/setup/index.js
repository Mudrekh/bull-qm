'use strict';

const fs = require('fs');
const dirs = fs.readdirSync(__dirname); // eslint-disable-line no-sync

dirs.forEach((file) => {
  if (file !== 'index.js') {
    require(`./${file}`); // eslint-disable-line global-require
  }
});
