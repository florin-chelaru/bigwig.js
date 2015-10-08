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

  /**
   * @type {number}
   * @name bigwig.models.Header#magic
   */
  this.magic;

  /**
   * @type {number}
   * @name bigwig.models.Header#version
   */
  this.version;

  /**
   * @type {number}
   * @name bigwig.models.Header#zoomLevels
   */
  this.zoomLevels;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#chromosomeTreeOffset
   */
  this.chromosomeTreeOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#fullDataOffset
   */
  this.fullDataOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#fullIndexOffset
   */
  this.fullIndexOffset;

  /**
   * @type {number}
   * @name bigwig.models.Header#fieldCount
   */
  this.fieldCount;

  /**
   * @type {number}
   * @name bigwig.models.Header#definedFieldCount
   */
  this.definedFieldCount;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#autoSqlOffset
   */
  this.autoSqlOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#totalSummaryOffset
   */
  this.totalSummaryOffset;

  /**
   * @type {number}
   * @name bigwig.models.Header#uncompressedBufSize
   */
  this.uncompressedBufSize;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#reserved
   */
  this.reserved;
};

goog.inherits(bigwig.models.Header, bigwig.models.BigwigStruct);

/**
 * @type {boolean}
 * @name bigwig.models.Header#bigEndian
 */
bigwig.models.Header.prototype.bigEndian;

/**
 * @type {boolean}
 * @name bigwig.models.Header#littleEndian
 */
bigwig.models.Header.prototype.littleEndian;

Object.defineProperties(bigwig.models.Header.prototype, {
  bigEndian: { get: /** @type {function (this:bigwig.models.Header)} */ (function() { return this.magic == 0x888FFC26; }) },
  littleEndian: { get: /** @type {function (this:bigwig.models.Header)} */ (function() { return !this.bigEndian; }) }
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

  var header = /** @type {bigwig.models.Header} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.Header, bigwig.models.Header['Fields'] , data, !bigEndian));
  header.magic = magic;

  return header;
};
