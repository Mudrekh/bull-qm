global.chai = require('chai');
global.should = global.chai.should();
global.expect = global.chai.expect;

global.sinon = require('sinon');

const chaiplugins = ['chai-as-promised', 'sinon-chai'];
chaiplugins.forEach(plugin => chai.use(require(plugin))); // eslint-disable-line
