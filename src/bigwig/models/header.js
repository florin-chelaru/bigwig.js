/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 10:36 AM
 */

goog.provide('bigwig.models.Header');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.Header = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.Header, bigwig.models.BigwigStruct);

Object.defineProperties(bigwig.models.Header.prototype, {
  /**
   * @property
   * @type {boolean}
   * @name bigwig.models.Header#bigEndian
   */
  'bigEndian': /** @type {boolean} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() { return this.magic == 0x888FFC26; }) }),

  /**
   * @property
   * @type {boolean}
   * @name bigwig.models.Header#bigEndian
   */
  'littleEndian': /** @type {boolean} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() { return !this.bigEndian; }) })
});

/**
 * @type {Object.<string, number>}
 */
bigwig.models.Header['Fields'] = {
  magic: 4,
  version: 2,
  zoomLevels: 2,
  chromosomeTreeOffset: 8,
  fullDataOffset: 8,
  fullIndexOffset: 8,
  fieldCount: 2,
  definedFieldCount: 2,
  autoSqlOffset: 8,
  totalSummaryOffset: 8,
  uncompressedBufSize: 4,
  reserved: 8
};

/**
 * @param {ArrayBuffer} data
 * @returns {bigwig.models.Header}
 */
bigwig.models.Header.fromArrayBuffer = function(data) {
  var view = new DataView(data);

  var magic = view.getUint32(0);
  var bigEndian = magic == 0x888FFC26;

  var header = bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.Header, bigwig.models.Header['Fields'] , data, !bigEndian);
  header.magic = magic;

  return header;
};
