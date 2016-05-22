// basic.js

'use strict';

const Depot = require('../lib/Depot');

new Depot()

.track(
  'echo',
  [ { $: 'input', alias: 'i', info: 'Some input.' } ],
  (input) => console.log(input)
)

.embark();
