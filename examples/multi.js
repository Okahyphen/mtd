// multi.js
'use strict';

const Depot = require('../lib/Depot');

new Depot()

.track('foo', [], () => {
  console.log('foo track');
})

.track('bar', [], () => {
  console.log('bar track');
})

.embark();
