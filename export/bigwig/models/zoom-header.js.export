/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 2:08 PM
 */

goog.provide('bigwig.models.ZoomHeader');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ZoomHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.ZoomHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ZoomHeader.Fields = {
  reductionLevel: 4,
  reserved: 4,
  dataOffset: 8,
  indexOffset: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ZoomHeader}
 */
bigwig.models.ZoomHeader.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ZoomHeader} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ZoomHeader, bigwig.models.ZoomHeader.Fields, data, littleEndian));
};
