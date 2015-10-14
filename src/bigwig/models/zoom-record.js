/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/13/2015
 * Time: 3:47 PM
 */

goog.provide('bigwig.models.ZoomRecord');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ZoomRecord = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#chrId
   */
  this.chrId;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#start
   */
  this.start;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#end
   */
  this.end;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#validCount
   */
  this.validCount;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#minVal
   */
  this.minVal;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#maxVal
   */
  this.maxVal;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#sumData
   */
  this.sumData;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#sumSquares
   */
  this.sumSquares;
};

goog.inherits(bigwig.models.ZoomRecord, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ZoomRecord['Fields'] = {
  chrId: 4,
  start: 4,
  end: 4,
  validCount: 4,
  minVal: -4,
  maxVal: -4,
  sumData: -4,
  sumSquares: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ZoomRecord}
 */
bigwig.models.ZoomRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ZoomRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ZoomRecord, bigwig.models.ZoomRecord['Fields'], data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ZoomRecord}
 */
bigwig.models.ZoomRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.ZoomRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.ZoomRecord, bigwig.models.ZoomRecord['Fields'], view, littleEndian));
};
