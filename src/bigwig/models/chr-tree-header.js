/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 3:52 PM
 */

goog.provide('bigwig.models.ChrTreeHeader');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.ChrTreeHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ChrTreeHeader['Fields'] = {
  magic: 4,
  blockSize: 4,
  keySize: 4,
  valSize: 4,
  itemCount: 8,
  reserved: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeHeader}
 */
bigwig.models.ChrTreeHeader.fromArrayBuffer = function(data, littleEndian) {
  return bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeHeader, bigwig.models.ChrTreeHeader['Fields'] , data, littleEndian);
};

