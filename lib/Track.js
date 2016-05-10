"use strict";
var Track = (function () {
    function Track(handle, options, block) {
        this.handle = handle;
        this.block = block;
        this.departed = false;
        this.options = options;
    }
    return Track;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Track;
