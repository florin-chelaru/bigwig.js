/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/28/2015
 * Time: 4:25 PM
 */

goog.provide('bigwig.models.FixedStepRecord');

goog.require('bigwig.models.Record');

/**
 * @constructor
 * @extends {bigwig.models.Record}
 */
bigwig.models.FixedStepRecord = function() {
  bigwig.models.Record.apply(this, arguments);
};

goog.inherits(bigwig.models.FixedStepRecord, bigwig.models.Record);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.FixedStepRecord['Fields'] = {
  value: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.FixedStepRecord}
 */
bigwig.models.FixedStepRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.FixedStepRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.FixedStepRecord, bigwig.models.FixedStepRecord['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.FixedStepRecord}
 */
bigwig.models.FixedStepRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.FixedStepRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.FixedStepRecord, bigwig.models.FixedStepRecord['Fields'] , view, littleEndian));
};



