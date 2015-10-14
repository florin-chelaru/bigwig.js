/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 1:18 PM
 */

goog.provide('bigwig.DataRecord');

/**
 * @constructor
 */
bigwig.DataRecord = function() {};

/**
 * @type {number}
 * @name {bigwig.DataRecord#chrName}
 */
bigwig.DataRecord.prototype.chrName;

/**
 * @type {number}
 * @name {bigwig.DataRecord#chr}
 */
bigwig.DataRecord.prototype.chr;

/**
 * @type {number}
 * @name {bigwig.DataRecord#start}
 */
bigwig.DataRecord.prototype.start;

/**
 * @type {number}
 * @name {bigwig.DataRecord#end}
 */
bigwig.DataRecord.prototype.end;

/**
 * @type {number}
 * @name {bigwig.DataRecord#value}
 */
bigwig.DataRecord.prototype.value;

Object.defineProperties(bigwig.DataRecord.prototype, {

  'chrName': { get: /** @type {function (this:bigwig.DataRecord)} */ (function() { throw new bigwig.BigwigException('Abstract method not implemented'); }) },

  'chr': { get: /** @type {function (this:bigwig.DataRecord)} */ (function() { throw new bigwig.BigwigException('Abstract method not implemented'); }) },

  'start': { get: /** @type {function (this:bigwig.DataRecord)} */ (function() { throw new bigwig.BigwigException('Abstract method not implemented'); })},

  'end': { get: /** @type {function (this:bigwig.DataRecord)} */ (function() { throw new bigwig.BigwigException('Abstract method not implemented'); })},

  'value': { get: /** @type {function (this:bigwig.DataRecord)} */ (function() { throw new bigwig.BigwigException('Abstract method not implemented'); }) }
});

/**
 * @returns {string}
 */
bigwig.DataRecord.prototype.toString = function() {
  return JSON.stringify(this.toJSON());
};

/**
 * @returns {{chr: string, start: number, end: number, value: number}}
 */
bigwig.DataRecord.prototype.toJSON = function() {
  return {'chr': this['chrName'], 'start': this['start'], 'end': this['end'], 'value': this['value']};
};
