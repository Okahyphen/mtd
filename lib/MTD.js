"use strict";
var minimist = require('minimist');
var Track_1 = require('./Track');
module.exports = (function () {
    function MTD(options, args) {
        if (!args || args === process.argv) {
            args = process.argv.slice(2);
        }
        var opts = this.remapOptions(options);
        this.defaults = opts.default;
        delete opts.default;
        this.argv = minimist(args, opts);
        this.settings = {
            multi: false,
            reruns: false,
            results: false
        };
        this.tracks = {};
    }
    MTD.prototype.configure = function (config) {
        for (var key in config) {
            if (config.hasOwnProperty(key) && this.settings.hasOwnProperty(key)) {
                this.settings[key] = config[key];
            }
        }
        return this;
    };
    MTD.prototype.track = function (handle, options, block) {
        if (this.track.hasOwnProperty(handle)) {
            throw new Error("Duplicate track " + handle);
        }
        this.tracks[handle] = new Track_1.default(handle, options, block);
        return this;
    };
    MTD.prototype.embark = function () {
        var _this = this;
        this.argv._.forEach(function (handle) {
            if (_this.tracks.hasOwnProperty(handle)) {
                var track = _this.tracks[handle];
                if (!track.departed || _this.settings.reruns) {
                    _this.dispatch(track);
                }
            }
        });
    };
    MTD.prototype.dispatch = function (track) {
        var _this = this;
        if (!track.cache) {
            track.cache = track.options.map(function (option) {
                return _this.argumentFromOption(option, track);
            });
        }
        track.departed = true;
        track.block.apply(this, track.cache);
    };
    MTD.prototype.argumentFromOption = function (option, track) {
        var optName = (this.argv.hasOwnProperty(option.$)
            ? option.$
            : (option.alias && this.argv.hasOwnProperty(option.alias))
                ? option.alias
                : '');
        if (optName) {
            return this.argv[optName];
        }
        if (option.hasOwnProperty('_')) {
            return option._;
        }
        if (this.defaults.hasOwnProperty(option.$)) {
            return this.defaults[option.$];
        }
        if (option.optional) {
            return;
        }
        throw new Error('Track is missing an option...');
    };
    MTD.prototype.remapOptions = function (options) {
        if (options === void 0) { options = []; }
        var result = {
            alias: {},
            boolean: [],
            default: {},
            string: []
        };
        options.forEach(function (option) {
            var name = option.$;
            if (option.hasOwnProperty('alias')) {
                result.alias[name] = option.alias;
            }
            if (option.hasOwnProperty('_')) {
                result.default[name] = option._;
            }
            if (option.hasOwnProperty('type') &&
                (option.type === 'boolean' || option.type === 'string')) {
                result[option.type].push(name);
            }
        });
        return result;
    };
    return MTD;
}());
