'use strict';

const fs = require('fs');
const dirs = fs.readdirSync(__dirname);

dirs.forEach((file) => {
  if (file !== 'index.js') {
    require(`./${file}`); //eslint-disable-line
  }
});
