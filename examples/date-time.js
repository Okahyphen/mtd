// date-time.js
const station = require('../lib/MTD');

function HMS (seconds) {
  this.hours = ~~(seconds / 3600);
  this.minutes = ~~((seconds % 3600) / 60);
  this.seconds = ~~(seconds % 60);
}

HMS.prototype.pretty = function () {
  console.log('Hour(s):\t%s\nMinute(s):\t%s\nSecond(s):\t%s',
    this.hours, this.minutes, this.seconds);
};

console.time('run');

new station([
  { $: 'date', _: 'Jan 1, 1970'}
])

.track('until', [ { $: 'date', _: "Jan 1, 2033" } ], function (date) {
  const seconds = ~~((Date.parse(date) - Date.now()) / 1000);

  console.log('Time until %s', date);
  new HMS(seconds).pretty();


  console.log('---\n', this);
})

.track('since', [ { $: 'date' } ], function (date) {
  const seconds = ~~((Date.now() - Date.parse(date)) / 1000);

  console.log('Time since %s', date);
  new HMS(seconds).pretty();
})

.embark();

console.timeEnd('run');
