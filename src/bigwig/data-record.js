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
 * @type {string}
 * @name bigwig.DataRecord#chrName
 */
bigwig.DataRecord.prototype.chrName;

/**
 * @type {number}
 * @name bigwig.DataRecord#chr
 */
bigwig.DataRecord.prototype.chr;

/**
 * @type {number}
 * @name bigwig.DataRecord#start
 */
bigwig.DataRecord.prototype.start;

/**
 * @type {number}
 * @name bigwig.DataRecord#end
 */
bigwig.DataRecord.prototype.end;

/**
 * @type {number}
 * @name bigwig.DataRecord#min
 */
bigwig.DataRecord.prototype.min;

/**
 * @type {number}
 * @name bigwig.DataRecord#max
 */
bigwig.DataRecord.prototype.max;

/**
 * @type {number}
 * @name bigwig.DataRecord#sum
 */
bigwig.DataRecord.prototype.sum;

/**
 * @type {number}
 * @name bigwig.DataRecord#sumsq
 */
bigwig.DataRecord.prototype.sumsq;

/**
 * @type {number}
 * @name bigwig.DataRecord#avg
 */
bigwig.DataRecord.prototype.avg;

/**
 * @type {number}
 * @name bigwig.DataRecord#norm
 */
bigwig.DataRecord.prototype.norm;

/**
 * @type {number}
 * @name bigwig.DataRecord#cnt
 */
bigwig.DataRecord.prototype.cnt;

Object.defineProperties(bigwig.DataRecord.prototype, {
  'min': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['MIN'])
    })
  },
  'max': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['MAX'])
    })
  },

  'sum': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['SUM'])
    })
  },

  'avg': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['AVG'])
    })
  },

  'sumsq': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['SUMSQ'])
    })
  },

  'norm': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['NORM'])
    })
  },

  'cnt': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['CNT'])
    })
  }
});

/**
 * @enum {number}
 */
bigwig.DataRecord.Aggregate = {
  'MIN': 0,
  'MAX': 1,
  'SUM': 2,
  'SUMSQ': 3,
  'AVG': 4,
  'NORM': 5,
  'CNT': 6
};

/**
 * @param {bigwig.DataRecord.Aggregate} [aggregate]
 */
bigwig.DataRecord.prototype.value = function(aggregate) {
  throw new bigwig.BigwigException('Abstract method not implemented');
};

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
