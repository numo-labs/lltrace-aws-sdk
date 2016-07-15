var test = require('tape');

var PAWS = require('..');

test('Exports', function (t) {
  t.assert(typeof PAWS.AWS === 'function', 'an AWS SDK constructor');
  t.assert(typeof PAWS.init === 'function', 'an init function');
  t.end();
});

test('Can create an AWS SDK instance', function (t) {
  var aws = new PAWS.AWS();
  t.assert(typeof aws === 'object', 'Constructor returns an object');
  t.end();
});
