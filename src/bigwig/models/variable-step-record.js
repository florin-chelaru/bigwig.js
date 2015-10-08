/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/28/2015
 * Time: 4:25 PM
 */

goog.provide('bigwig.models.VariableStepRecord');

goog.require('bigwig.models.Record');

/**
 * @constructor
 * @extends {bigwig.models.Record}
 */
bigwig.models.VariableStepRecord = function() {
  bigwig.models.Record.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.VariableStepRecord#chromStart
   */
  this.chromStart;
};

goog.inherits(bigwig.models.VariableStepRecord, bigwig.models.Record);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.VariableStepRecord['Fields'] = {
  chromStart: 4,
  value: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.VariableStepRecord}
 */
bigwig.models.VariableStepRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.VariableStepRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.VariableStepRecord, bigwig.models.VariableStepRecord['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.VariableStepRecord}
 */
bigwig.models.VariableStepRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.VariableStepRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.VariableStepRecord, bigwig.models.VariableStepRecord['Fields'] , view, littleEndian));
};



