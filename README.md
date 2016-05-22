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

## Learn By Example

Below is a basic example of a command line application with a single track, `echo`, which in turn has a single, required command line option, `input` or `i`.

```javascript
// basic.js
'use strict';

const Depot = require('mtd');

new Depot()

.track(
  'echo',
  [ { $: 'input', alias: 'i', info: 'Some input.' } ],
  (input) => console.log(input)
)

.embark();
```

From the root of this project, we can test out our script as `$ node examples/basic.js echo`.

This however results in an error:

```
Track [ echo ] missing options:
    --input (-i)    Some input.
```

MTD has spotted that our `echo` track is missing an option, and lets us know.

If we try again, `$ node examples/basic.js echo --input Hello!`, we'll get the appropriate response:

```
Hello!
```

To allow for _optional_ options, you must specify a default, using the property `_`. If we changed the second argument of `track` to `[ { $: 'input', _: 'Yo.' alias: 'i', info: 'Some input.' } ],`, and ran `$ node examples/basic.js echo` again, we'd see no issues, and `Yo.` would be printed to our terminal.

## Documentation

### Requiring

Requiring the module works very much like most `Node` modules do.

```javascript
const Depot = require('mtd');
```

With the previous, `Depot` now holds a reference to the chief export, a class of the same name. You can of course give this any identifier you'd like.

_Note: The rest of this document uses TypeScript notation._

### Construction

```javascript
constructor (options?: TypedOption[], args?: string[])
```

When constructed, `Depot` instances take two optional arguments: `options`, and `args`.

`Option` and `TypedOption`  objects will be explained below.

`args` is an array of strings to parse as command line arguments. It defaults to `process.argv.slice(2)` if not provided (or if passed `process.argv`).

### Methods

Note the methods that return the instance (`configure`, `track`, `default`, `always`), and as such can be chained.

#### Configuring

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
  multi: true, // Allow execution of more than one track
  reportErrors: true, // Print missing arguments and issues
  reruns: false // Allow multiple executions of the same track
})
```

#### Laying Tracks

The following three methods each create `Track` objects from their arguments. They are used to register tracks within a `Depot` instance, and specify the command line arguments that are required.

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

`default` creates a regular track, and sets it as the default track to execute if no tracks are provided via the command line. There can only be one default track at any given time, and repeat invocations will override an existing default.

```javascript
public always (
  handle: string,
  options: Option[],
  block: Block
): this
```

`always` creates a regular track, and pushes its handle into an array of tracks that will be executed after all other tracks have departed.

The arguments for all three methods are the same, and are as follows:

-   `handle` is the name of the track, and must be unique. Remember that tracks are defined as the loose arguments provided to a command line application.

-   `options` is an array of `Option`-like objects (see below), whose order corresponds with the arguments specified by `block`.

-   `block` is a generic function, with the signature `(...args: any[]): any;`, and is the executable context of the track.

##### Example

```javascript
.track(
  'foo',
  [ { $: 'bar', _: false, alias: 'b', info: 'A description.' } ],
  bar => {
    if (bar) { ... }
    ...
  }
)
```

#### Heading Off

```javascript
public embark (): void
```

`embark` is the final method that sets your command line application in motion. Call it after all tracks have been registered.

Failure to invoke this method will result in no tracks being dispatched.

##  Option-like Objects (`Option`, `TypedOption`)

`Option` objects are used by the instance constructor for initial parsing, and global option settings. They are also used on a per-track track basis for specifying the command line arguments to be injected into the execution context.

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
   * A default value to use in the event that no value
   * is specified via the command line.
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
}
```

The instance constructor alternatively takes an optional array of objects matching an extended version of the `Object` interface, `TypedOption`. These objects have two additional type properties, to tell the initial argument parsing which type the inputs should be resolved to. See [minimist][minimist] for more information.

```javascript
interface TypedOption extends Option {
    bool?: boolean;
    string?: boolean;
}
```

These two options are mutually exclusive (if you include both, `bool` takes precedence).

`string` is useful for forcing large integers to be parsed as strings, without losing information to 53-bit doubles, since numeric-like arguments are treated as numbers otherwise.

These are not available to per-track `Option` objects, since the argument parsing is long done by the time those are reviewed. They must be shadowed from the instance constructor option pool if you need these type assurances.

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
