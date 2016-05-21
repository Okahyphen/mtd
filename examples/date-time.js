// date-time.js
'use strict';

const Depot = require('../lib/MTD');

class HMS {
  constructor (seconds) {
    this.hours = ~~(seconds / 3600);
    this.minutes = ~~((seconds % 3600) / 60);
    this.seconds = ~~(seconds % 60);
  }

  prettyPrint () {
    console.log('Hour(s):\t%s\nMinute(s):\t%s\nSecond(s):\t%s',
      this.hours, this.minutes, this.seconds);
  }
}

new Depot([
  { $: 'date', alias: 'd', info: 'A valid date string.' }
])

.default('until', [ { $: 'date' } ], (date, foo) => {
  const seconds = ~~((Date.parse(date) - Date.now()) / 1000);

  console.log('Time until %s:', date);
  new HMS(seconds).prettyPrint();
})

.track('since', [ { $: 'date' } ], (date) => {
  const seconds = ~~((Date.now() - Date.parse(date)) / 1000);

  console.log('Time since %s:', date);
  new HMS(seconds).prettyPrint();
})

.always('now', [], () => {
  console.log('Date and time is %s.', new Date().toString());
})

.embark();
