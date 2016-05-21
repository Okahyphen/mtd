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

Enjoy!

[Oka.io](http://oka.io/) | [@Okahyphen](https://twitter.com/Okahyphen)

[npm-url]: https://www.npmjs.com/package/mtd
[npm-image]: http://img.shields.io/npm/v/mtd.svg
[npm-downloads]: http://img.shields.io/npm/dm/mtd.svg

[minimist]: https://www.npmjs.com/package/minimist
[license]: https://github.com/Okahyphen/mtd/blob/master/LICENSE
