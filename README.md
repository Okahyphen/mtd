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

station({
  date: ['a valid date string']
})

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

With this basic example we can now test out our command line application as `node date-time until --date "November 11, 2020"` and something along the lines of

```
Time until November 11, 2020
Hour(s):	42449
Minute(s):	22
Second(s):	51
```

will be printed to our terminal. Now the same application could be run as `node date-time since --date "November 11, 1951"` and we'd see

```
Time since November 11, 1951
Hour(s):	562422
Minute(s):	40
Second(s):	53
```

### Missing links

We can see that both `tracks` depend on the command line option `date`, as shown in each function's argument list. What happens when we fail to provide that option?

```
Required option(s) not found for [ until ] track:
  --date		a valid date string
```

MTD lets us know that we've failed to provide a necessary command line option, and which track required it. If we fail to provide more than one option, they are all shown.

### Execution Order & Multi-tracks

MTD is synchronous.

Tracks are executed in the order that they are passed to the command line application.

If we ran our previous example as `node date-time since until --date "Jan 1, 2000"` we would see something like

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

### Requiring

Requiring the module works very much like most `Node` modules do.

```javascript
var mtd = require('mtd');
```

With the previous, `mtd` is now a function (called `barrier` internally) that, when invoked, returns a new instance of `MTD`. This acts as a construction wrapper.

### Construction

```javascript
mtd(options :: Object)
```

When constructed, `MTD` instances take one argument - an object containing command line options as keys, and arrays as their values. These keys are arbitrary, and this object is optional. Command line options will be parsed regardless of if they exist in this object or not.

The arrays should contain only the following, in order.

- [0] : A description of the option, for error/help messages.
- [1] : A single character alias for the option.
- [2] : A forced type to be used when parsed, either `string` or `boolean`.
- [3] : A default value.

To omit any of the first three elements, set them individually as `null`.

```javascript
mtd({
  date: ['a valid date string', 'd', 'string', 'January 1, 1970'],
  timestamp: [null, 't', null, 516078000000]
})
```

### Properties

Instances of MTD contain the following properties:

- `information :: Object` - An object containing the following key-values:
  - `descriptions :: Object` - A mapping of command line options to their help messages.
  - `parsed :: Object` - The transformed options object for `minimist` to digest.
  - `aliases :: Object` - A convenience reference to `information.parsed.alias`.
- `options :: Object` - The object returned from `minimist`'s parsing of command line arguments and options.
- `argv :: Array` - A convenience reference to `options._`, the loose command line arguments.
- `settings :: Object` - An object containing the following key-values:
  - `multi :: Boolean` - Whether multiple `tracks` can be run from the command line arguments (`options._`). Default `true`.
  - `reruns :: Boolean` - Whether individual `tracks` can be run multiple times. Default `true`.
  - `results :: Boolean` - Whether the most recent result of an individual `Track` should be stored in `Track.result`. Default `false`.
- `tracks :: Object` - An object containing `Track` objects. Each object has the following properties:
  - `block :: Function` - The execution context to be invoked.
  - `departed :: Boolean` - Whether or not the `Track` has run at least once.
  - `requirements :: Array` - An array of strings, corresponding to the command line options.
  - `result :: Any` - The most recent return value from invoking the `Track.block`. Setting dependent.
- `_radio :: Object` - An empty object, to be used for data sharing between tracks. See `MTD.prototype.radio`.
- `_before :: Array` - An array of `track` string names to be invoked in order, before any command line argument tracks.
- `_default :: Null/String` - The default `track` to be invoked if there are no command line argument tracks.
- `_after :: Array` - An array of `track` string names to be invoked in order, after any command line argument tracks.

Generally, none of the properties should be written to directly.

### Methods

MTD has the following prototype methods.

#### MTD.prototype.configure

```javascript
.configure(config :: Object)
```

This method takes an object where the values of any keys also found in the `settings` object property of the `MTD` instance will be overwritten with the values from this provided object.

- Chainable: _this method returns the instance._

##### Example

```javascript
.configure({
  reruns: false,
  results: true
})
```

#### MTD.prototype.track

```javascript
.track(name :: String, requirements :: Array, block :: Function)
```

This method creates `Track` objects, stored in the `tracks` instance property. There are three valid ways to pass arguments to this method, but a string `name` is always required as the first argument. All three styles can be seen in the example below.

- Unique Input: _No two `Track` objects should be associated with the same string `name`_.
- Chainable: _this method returns the instance._

##### Example

```javascript
.track('up', ['one', 'two'], function (one, two) {
  // the standard argument format.
})
.track('down', function (one, two) {
  // with this style, a requirements array is built from parsing the source code of the given block.
  // this style should be avoided if you need command line options that are not valid JavaScript identifiers.
})
.track('left', ['one', 'two', function (one, two) {
  // with this style, the block argument is the last element of the requirements array.
}])
```

#### MTD.prototype.default

```javascript
.default(name :: String, requirements :: Array, block :: Function)
```

Sets the default `Track` to be invoked in the event that _no_ `tracks` are specified in the command line arguments. There can only be __one__ default `Track` at a given time.

This method takes arguments in a similar way to `MTD.prototype.track`, since it calls `.track` internally, but with two exceptions:

- If _only_ a string `name` is provided, it is assumed an associated `Track` exists, or will soon exist, in the `tracks` instance property. `.track` is not invoked.

- If no `name` is provided, a default `track` name of `'MTD_DEFAULT'` is provided with the call to `.track`.

In any event, the `_default` instance property is set to whatever `name` is decided upon.

- Chainable: _this method returns the instance._

#### Example

```javascript
.default('yo') // assumes a 'yo' Track exists, or will exist
.default('yo', ['one', 'two'], function (one, two) {
  // invokes MTD.prototype.track, creating or overriding a Track named 'yo'
})
.default(['one', 'two', function (one, two) {
  // same as above, but passes 'MTD_DEFAULT' as the name argument to MTD.prototype.track
}])
.default(function (one, two) {
  // same as above, MTD.prototype.track parses block argument requirements
})
```

#### MTD.prototype.before

```javascript
.before(name :: String, requirements :: Array, block :: Function)
```

Registers `Track` names to always be invoked, in order, _before_ any command line argument or `_default` tracks.

This method follows the same rules as `MTD.prototype.default`, but pushes the name of the track into the `_before` array instance property.

If `name` is not provided, a name is generated as `'MTD_BEFORE_N'` - where `N` is the current length of the `_before` array.

- Chainable: _this method returns the instance._

##### Example

```javascript
.before('first') // assumes a 'first' Track exists, or will exist
.before(function (alpha, beta) {
  // create a new Track called 'MTD_BEFORE_0'
})
```

#### MTD.prototype.after

```javascript
.after(name :: String, requirements :: Array, block :: Function)
```

Works identically to `MTD.prototype.before`, but registers `Track` names to always be invoked, in order, _after_ any command line argument or `_default` tracks.

Pushes `Track` names into the `_after` array instance property. Generated names take the form `'MTD_AFTER_N'`.

- Chainable: _this method returns the instance._

##### Example

```javascript
.after('last') // assumes a 'last' Track exists, or will exist
.after(function (alpha, beta) {
  // create a new Track called 'MTD_AFTER_0'
})
```

#### MTD.prototype.dispatch

```javascript
.dispatch(track :: String)
```

This method manages just-in-time dependency injection, and invocation of individual `Track` objects.

It can be used to invoke a `Track` manually.

##### Example

```javascript
.dispatch('yo') // manually invokes the 'yo' Track
```

#### MTD.prototype.radio

```javascript
.radio(key :: String, value :: Any, protect :: Boolean)
```

#### MTD.prototype.embark

```javascript
.embark()
```

### Track context

When invoked, `tracks` have their contextual `this` set to the instance of `MTD`.

---

Enjoy!

[Oka.io](http://oka.io/) | [@Okahyphen](https://twitter.com/Okahyphen)

[npm-url]: https://www.npmjs.com/package/mtd
[npm-image]: http://img.shields.io/npm/v/mtd.svg
[npm-downloads]: http://img.shields.io/npm/dm/mtd.svg

[minimist]: https://www.npmjs.com/package/minimist
