/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 3:27 PM
 */

goog.provide('bigwig.models.TotalSummary');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.TotalSummary = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.TotalSummary, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.TotalSummary.Fields = {
  basesCovered: 8,
  minVal: -8,
  maxVal: -8,
  sumData: -8,
  sumSquares: -8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.TotalSummary}
 */
bigwig.models.TotalSummary.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.TotalSummary} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.TotalSummary, bigwig.models.TotalSummary.Fields, data, littleEndian));
};
