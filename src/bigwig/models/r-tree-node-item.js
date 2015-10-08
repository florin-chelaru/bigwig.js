/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/25/2015
 * Time: 2:46 PM
 */

goog.provide('bigwig.models.RTreeNodeItem');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.RTreeNodeItem = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.RTreeNodeItem, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeNodeItem['Fields'] = {
  startChromIx: 4,
  startBase: 4,
  endChromIx: 4,
  endBase: 4,
  dataOffset: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeItem}
 */
bigwig.models.RTreeNodeItem.fromArrayBuffer = function(data, littleEndian) {
  return bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeNodeItem, bigwig.models.RTreeNodeItem['Fields'] , data, littleEndian);
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeItem}
 */
bigwig.models.RTreeNodeItem.fromDataView = function(view, littleEndian) {
  return bigwig.models.BigwigStruct.fromDataView(bigwig.models.RTreeNodeItem, bigwig.models.RTreeNodeItem['Fields'] , view, littleEndian);
};
