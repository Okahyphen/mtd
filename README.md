<p align="center">
  <a href="https://www.npmjs.com/package/mtd">
    <img src="http://i.imgur.com/t4OEBmj.gif" />
  </a>
</p>

# MTD

**Multi-track drifting for your command line applications**

[![NPM version][npm-image]][npm-url] [![Downloads][npm-downloads]][npm-url]

Just-in-time dependency injection of command line options for executable contexts in Node.js.

## What is MTD?

More formally, MTD stands for _managing terminal dependencies_ - but that's no fun.

MTD is a lightweight module that wraps around [minimist][minimist], providing an intelligent way to define _tracks_ that your command line application might travel down, and allowing you to specify the command line options that each track depends upon. _Tracks_ are essentially different execution contexts that your singular command line application might want to run, and are defined as the loose arguments provided to a command line application.

## Install

Using [npm](https://www.npmjs.com/), of course.

```shell
$ npm install mtd
```

## Example

Here's an example of a simple command line application that processes dates, using MTD.

```javascript
// date-time.js
var station = require('mtd');

function HMS (seconds) {
  this.hours = ~~(seconds / 3600);
  this.minutes = ~~((seconds % 3600) / 60);
  this.seconds = ~~(seconds % 60);
}

HMS.prototype.pretty = function () {
  console.log('Hour(s):\t%s\nMinute(s):\t%s\nSecond(s):\t%s',
    this.hours, this.minutes, this.seconds);
};

station({string: ['date']})

.track('until', function (date) {
  var seconds = ~~((Date.parse(date) - Date.now()) / 1000);

  console.log('Time until %s', date);
  new HMS(seconds).pretty();
})

.track('since', function (date) {
  var seconds = ~~((Date.now() - Date.parse(date)) / 1000);

  console.log('Time since %s', date);
  new HMS(seconds).pretty();
})

.embark();
```

With this basic example we can now test out our command line application as `node date-time until --date="November 11, 2020"` and something along the lines of

```
Time until November 11, 2020
Hour(s):	42449
Minute(s):	22
Second(s):	51
```

will be printed to our terminal. Now the same application could be run as `node date-time since --date="November 11, 1951"` and we'd see

```
Time since November 11, 1951
Hour(s):	562422
Minute(s):	40
Second(s):	53
```

### Missing links

We can see that both `tracks` depend on the command line option `date`, as shown in each function argument list. What happens when we fail to provide that option?

```
Required option(s) not found for [ since ]:
  date
```

MTD lets us know that we've failed to provide a necessary command line option, and which track required it. If we fail to provide more than one option, they are all shown.

### Execution Order & Multi-tracks

MTD is synchronous.

Tracks are executed in the order that they are passed to the command line application.

If we ran our previous example as `node date-time since until --date="Jan 1, 2000"` we would see something like

```
Time since Jan 1, 2000
Hour(s):	140430
Minute(s):	56
Second(s):	33
Time until Jan 1, 2000
Hour(s):	-140430
Minute(s):	-56
Second(s):	-33
```

in our terminal.

### Parsed dependencies

To omit dependency lists, and rely on parsing function arguments, functions should conform to ES5 style arguments. No fancy ES6 allowed.

That is all.

## Usage & Documentation

Very soon...

---

Enjoy!

[Oka.io](http://oka.io/) | [@Okahyphen](https://twitter.com/Okahyphen)

[npm-url]: https://www.npmjs.com/package/mtd
[npm-image]: http://img.shields.io/npm/v/mtd.svg
[npm-downloads]: http://img.shields.io/npm/dm/mtd.svg

[minimist]: https://www.npmjs.com/package/minimist
