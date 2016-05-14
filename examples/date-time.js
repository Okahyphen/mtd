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

new station([
  { $: 'date', _: 'Jan 1, 1970'}
])

.default('until', [ { $: 'date', _: "Jan 1, 2033" } ], function (date) {
  const seconds = ~~((Date.parse(date) - Date.now()) / 1000);

  console.log('Time until %s', date);
  new HMS(seconds).pretty();
})

.track('since', [ { $: 'date' } ], function (date) {
  const seconds = ~~((Date.now() - Date.parse(date)) / 1000);

  console.log('Time since %s', date);
  new HMS(seconds).pretty();
})

.always('now', [], function () {
  console.log('Time is %s.', new Date().toString());
})

.embark();
