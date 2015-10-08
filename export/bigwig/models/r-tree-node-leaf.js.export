/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/25/2015
 * Time: 2:47 PM
 */

goog.provide('bigwig.models.RTreeNodeLeaf');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.RTreeNodeLeaf = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.RTreeNodeLeaf, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeNodeLeaf.Fields = {
  startChromIx: 4,
  startBase: 4,
  endChromIx: 4,
  endBase: 4,
  dataOffset: 8,
  dataSize: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeLeaf}
 */
bigwig.models.RTreeNodeLeaf.fromArrayBuffer = function(data, littleEndian) {
  return bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeNodeLeaf, bigwig.models.RTreeNodeLeaf.Fields, data, littleEndian);
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeLeaf}
 */
bigwig.models.RTreeNodeLeaf.fromDataView = function(view, littleEndian) {
  return bigwig.models.BigwigStruct.fromDataView(bigwig.models.RTreeNodeLeaf, bigwig.models.RTreeNodeLeaf.Fields, view, littleEndian);
};
