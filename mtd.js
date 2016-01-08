// mtd.js
// Colin 'Oka' Hall-Coates, <yo@oka.io>
// MIT, 2016

var ARGS = require('minimist');

function MTD (options) {
  this.options = ARGS(process.argv.slice(2), options);
  this.argv = this.options._;
  this.tracks = {};
  this.radio = {};
  this._default = null;
  this._always = [];
}

MTD.prototype.halt = function (track, failures) {
  console.warn('Required option(s) not found for [ %s ]:', track);

  failures.forEach(function (failure) {
    console.warn('\t%s', failure);
  });
};

var isFunction = function (object) {
  return typeof object === 'function';
};

var parse = function (block) {
  var args = block.length && /\(\s*([^)]+?)\s*\)/.exec(block.toString());
  return args ? args[1].split(/\s*,\s*/) : [];
};

MTD.prototype.track = function (name, requirements, block) {
  var jump;

  if (isFunction(requirements)) {
    block = requirements;
    requirements = parse(block);
    jump = true;
  } else if (!isFunction(block))
    block = requirements.pop();

  if (jump || isFunction(block))
    this.tracks[name] = {
      requirements: requirements,
      block: block
    };
  else console.warn('No block given for [ %s ].', name);

  return this;
};

MTD.prototype.default = function (name, requirements, block) {
  if (typeof name !== 'string') {
    block = requirements;
    requirements = name;
    name = 'MTD_DEFAULT';
  }

  if (!requirements || this.track(name, requirements, block))
    this._default = name;

  return this;
};

MTD.prototype.always = function (name, requirements, block) {
  var always = this._always;

  if (typeof name !== 'string') {
    block = requirements;
    requirements = name;
    name = 'MTD_ALWAYS_' + always.length;
  }

  if (!requirements || this.track(name, requirements, block))
    always.push(name);

  return this;
};

MTD.prototype.dispatch = function (track) {
  var
  tracks = this.tracks,
  options, context, bindings, failures;

  if (tracks.hasOwnProperty(track))
    context = tracks[track];
  else return console.warn('Track [ %s ] not found.', track);

  options = this.options;
  bindings = context.requirements.map(function (requirement) {
    if (options.hasOwnProperty(requirement))
      return options[requirement];
    else if (failures) failures.push(requirement);
    else failures = [requirement];
  });

  if (failures) return this.halt(track, failures);

  context.block.apply(this, bindings);
};

var dispatcher = function (track) {
  this.dispatch(track);
};

MTD.prototype.embark = function () {
  var def, argv = this.argv;

  if (argv.length)
    argv.forEach(dispatcher, this);
  else if ((def = this._default))
    this.dispatch(def);

  this._always.forEach(dispatcher, this);
};

module.exports = function barrier (options) {
  return new MTD(options);
};
