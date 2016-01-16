<p align="center">
  <a href="https://www.npmjs.com/package/mtd">
    <img src="http://i.imgur.com/t4OEBmj.gif" />
  </a>
</p>

# MTD

**Multi-track drifting for your command line applications**

[![NPM version][npm-image]][npm-url] [![Downloads][npm-downloads]][npm-url]

Just-in-time dependency injection of command line options for executable contexts in Node.js.

Curious? All aboard!

1. <a href="#whatis">What is MTD?</a>
1. <a href="#install">Installation</a>
1. <a href="#info">Example & Basic Info</a>
  - <a href="#missing">Missing links</a>
  - <a href="#order">Execution Order & Multi-tracks</a>
1. <a href="#usage">Usage & Documentation</a>
  - <a href="#requiring">Requiring</a>
  - <a href="#construction">Construction</a>
  - <a href="#properties">Properties</a>
  - <a href="#methods">Methods</a>
  - <a href="#context">Track context</a>
  - <a href="#parsing">Parsed dependencies</a>
1. <a href="#extras">Extras</a>
1. <a href="#license">License</a>

<a name="whatis"></a>
## What is MTD?

More formally, MTD stands for _managing terminal dependencies_ - but that's no fun.

MTD is a lightweight module that wraps around [minimist][minimist], providing an intelligent way to define _tracks_ that your command line application might travel down, and allowing you to specify the command line options that each track depends upon. _Tracks_ are essentially different execution contexts that your singular command line application might want to run, and are defined as the loose arguments provided to a command line application.

<a name="install"></a>
## Install

Using [npm](https://www.npmjs.com/), of course.

```shell
$ npm install mtd
```

<a name="info"></a>
## Example & Basic Info

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

<a name="missing"></a>
### Missing links

We can see that both `tracks` depend on the command line option `date`, as shown in each function's argument list. What happens when we fail to provide that option?

```
Required option(s) not found for [ until ] track:
  --date		a valid date string
```

MTD lets us know that we've failed to provide a necessary command line option, and which track required it. If we fail to provide more than one option, they are all shown.

<a name="order"></a>
### Execution Order & Multi-tracks

MTD is synchronous.

Tracks are executed in the order that they are passed to the command line application. There are configuration options to disable multiple tracks, and the rerunning of individual tracks.

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

<a name="usage"></a>
## Usage & Documentation

<a name="requiring"></a>
### Requiring

Requiring the module works very much like most `Node` modules do.

```javascript
var mtd = require('mtd');
```

With the previous, `mtd` is now a function (called `barrier` internally) that, when invoked, returns a new instance of `MTD`. This acts as a construction wrapper.

<a name="construction"></a>
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

<a name="properties"></a>
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

<a name="methods"></a>
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

This is a getter/setter method for ease-of-use interaction with the `_radio` instance property. Its functionality is twofold:

- If _only_ a `key` is provided, this method acts as a getter, returning the value associated with the given string.

- If a `key` and a `value` are provided, this method acts as a setter, associating the given value with the given key, and returning the value.

  - If `protect` is provided as a truthy value, `value` will _only_ be associated with `key` if the given `key` does not already have an associated value.

This is useful for providing values or instances of objects that multiple tracks may wish to share.

##### Example

In this example, we have two `tracks` where we know we will want an instance of `MySharedObject`. We can set up a `before` track, that checks if our command line application has been passed a `key` option. With that information, and a uniform designation of the `key` option, we can set up our tracks so that if multiple `key` dependents are invoked we already have a shared object, and don't need to construct additional instances.

```javascript
.before(function () {
  var key = this.options.key;
  if (key) this.radio('instance', new MySharedObject(key));
})
.track('foo', function (key, alpha) {
  this.radio('instance').doSomething(alpha);
})
.track('bar', function (key, beta) {
  this.radio('instance').doSomethingElse(beta);
})
```

#### MTD.prototype.embark

```javascript
.embark()
```

This is the runner method, which handles dispatching `tracks` found in `_before`, `argv` or `_default`, and `_after`. It should always be called last. If you forget to include this, your application likely won't do anything.

<a name="context"></a>
### Track context

When invoked, `tracks` have their contextual `this` set to the controlling instance of `MTD`.

This allows for ease of access to non-dependent command line options found in the `.options` property, the `.radio` method, and any other instance properties or prototype methods your `Track` might want to use.

As such, `Track` _blocks_ should not be object methods, or a function where the contextual `this` would need to be bound elsewhere in order for the function to operate properly.

<a name="parsing"></a>
### Parsed dependencies

To omit `Track` dependency lists, and rely on parsing function arguments, functions should conform to ES5 style arguments. No fancy ES6 allowed.

<a name="extras"></a>
## Extras

- [`mtd-help`](https://github.com/Okahyphen/mtd-help) - A helpful `Track`.

<a name="license"></a>
## License

MTD is MIT!

Read it [here][license].

---

Enjoy!

[Oka.io](http://oka.io/) | [@Okahyphen](https://twitter.com/Okahyphen)

[npm-url]: https://www.npmjs.com/package/mtd
[npm-image]: http://img.shields.io/npm/v/mtd.svg
[npm-downloads]: http://img.shields.io/npm/dm/mtd.svg

[minimist]: https://www.npmjs.com/package/minimist
[license]: https://github.com/Okahyphen/mtd/blob/master/LICENSE
