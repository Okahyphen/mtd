# MTD

**Multi-track drifting for your command line applications**

[![NPM version][npm-image]][npm-url] [![Downloads][npm-downloads]][npm-url]

[![logo](http://i.imgur.com/t4OEBmj.gif)](https://github.com/Okahyphen/mtd)

Just-in-time dependency injection of command line options for executable contexts in Node.js.

More formally, MTD stands for _managing terminal dependencies_ - but that's no fun.

MTD is a lightweight module that wraps around [minimist][minimist], providing an intelligent way to define _tracks_ that your command line application might travel down, and allowing you to specify the command line options that each track depends upon. _Tracks_ are essentially different execution contexts that your singular command line application might want to run, and are defined as the loose arguments provided to a command line application.

## Install

Using [npm](https://www.npmjs.com/), of course.

```shell
$ npm install mtd
```

## Documentation

### Requiring

Requiring the module works very much like most `Node` modules do.

```javascript
const Depot = require('mtd');
```

With the previous, `Depot` now holds a reference to the chief export, a class of the same name.

### Construction

```javascript
constructor (options?: Option[], args?: string[])
```

When constructed, `Depot` instances take two optional arguments: `options`, and `args`.

`Option` objects will be explained below.

`args` is an array of strings to parse as command line arguments. It defaults to `process.argv.slice(2)` if not provided (or if passed `process.argv`).

### Methods

```javascript
public configure (
  config: Settings
): this
```
This method takes an object where the values of any keys also found in the `settings` object property of the `Depot` instance will be overwritten with the values from this provided object.

##### Example

This example shows the configuring the instance with the default settings.

```javascript
.configure({
  multi: true, // Execute more than one track
  reportErrors: true, // Print missing arguments
  reruns: false // Allow multiple executions of the same track
})
```

The following three methods each create `Track` objects from their arguments.

They are used to register tracks within `Depot`, and specify command line arguments that are required.

`handle` is the name of the track, and must be unique. Remember that tracks are defined as the loose arguments provided to a command line application.

`options` is an array of `Option`-like objects (see below), whose order corresponds with the arguments specified by `block`.

`block` is a generic function, with the signature `(...args: any[]): any;`, and is the executable context of the track.

```javascript
public track (
  handle: string,
  options: Option[],
  block: Block
): this
```

`track` creates a regular track.

```javascript
public default (
  handle: string,
  options: Option[],
  block: Block
): this
```

`default` creates a regular track, and sets it as the default track to execute if no tracks are provided via the command line.

```javascript
public always (
  handle: string,
  options: Option[],
  block: Block
): this
```

`always` creates a regular track, and pushes its handle into an array of tracks that will be executed, no matter what, after all other tracks have departed.

```javascript
public embark (): void
```

`embark` is the final method that sets your command line application in motion. Call it after all tracks have been registered.

Failure to invoke this method will result in nothing happening.

## Option(s), Option-like Objects

Option-like objects have the following interface description.

```javascript
interface Option extends Object {
  [index: string]: any;

  /*
   * The name of the command line option.
   * The most important property, and the only one that is required.
   * It is also the most used property, so we use $ for brevity.
   *
   * $: foo would correspond with the command line option --foo
   */
  $: string;

  /*
  A default value
  */
  _?: any;

  /*
   * An alternative name ($) to use.
   * Generally speaking, this should be a single character,
   * but that's not strictly enforced.
   */
  alias?: string;
  /*
   * A description of the command line option,
   * used for self documentation.
   */
  info?: string;

  /*
   * Whether or not the option is actually optional.
   * Defaults to false.
   * Passed options will resolve to undefined in argument lists.
   */
  pass?: boolean;

  /*
   * A type to force the parsed value to align with.
   * Valid values: 'boolean', 'string'
   */
  type?: string;
}
```

## Extras

-   [`mtd-help`](https://github.com/Okahyphen/mtd-help) - A helpful `Track`.

## License

MTD is MIT!

Read it [here][license].

Enjoy!

[Oka.io](http://oka.io/) | [@Okahyphen](https://twitter.com/Okahyphen)

[npm-url]: https://www.npmjs.com/package/mtd
[npm-image]: http://img.shields.io/npm/v/mtd.svg
[npm-downloads]: http://img.shields.io/npm/dm/mtd.svg

[minimist]: https://www.npmjs.com/package/minimist
[license]: https://github.com/Okahyphen/mtd/blob/master/LICENSE
