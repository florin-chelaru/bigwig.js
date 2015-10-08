/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/28/2015
 * Time: 4:25 PM
 */

goog.provide('bigwig.models.BedGraphRecord');

goog.require('bigwig.models.Record');

/**
 * @constructor
 * @extends {bigwig.models.Record}
 */
bigwig.models.BedGraphRecord = function() {
  bigwig.models.Record.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.BedGraphRecord#chromStart
   */
  this.chromStart;

  /**
   * @type {number}
   * @name bigwig.models.BedGraphRecord#chromEnd
   */
  this.chromEnd;
};

goog.inherits(bigwig.models.BedGraphRecord, bigwig.models.Record);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.BedGraphRecord['Fields'] = {
  chromStart: 4,
  chromEnd: 4,
  value: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.BedGraphRecord}
 */
bigwig.models.BedGraphRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.BedGraphRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.BedGraphRecord, bigwig.models.BedGraphRecord['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.BedGraphRecord}
 */
bigwig.models.BedGraphRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.BedGraphRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.BedGraphRecord, bigwig.models.BedGraphRecord['Fields'] , view, littleEndian));
};



