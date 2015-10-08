/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 8:31 PM
 */

goog.provide('bigwig.models.ChrTreeNodeItem');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeNodeItem = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.ChrTreeNodeItem, bigwig.models.BigwigStruct);

/**
 * @param {ArrayBuffer} data
 * @param {number} keySize
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNodeItem}
 */
bigwig.models.ChrTreeNodeItem.fromArrayBuffer = function(data, keySize, littleEndian) {
  return bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeNodeItem, {key: keySize, childOffset: 8}, data, littleEndian);
};

/**
 * @param {DataView} view
 * @param {number} keySize
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNodeItem}
 */
bigwig.models.ChrTreeNodeItem.fromDataView = function(view, keySize, littleEndian) {
  return bigwig.models.BigwigStruct.fromDataView(bigwig.models.ChrTreeNodeItem, {key: keySize, childOffset: 8}, view, littleEndian);
};
