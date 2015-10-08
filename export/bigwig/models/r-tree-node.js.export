/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/25/2015
 * Time: 2:42 PM
 */

goog.provide('bigwig.models.RTreeNode');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.RTreeNode = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.RTreeNode, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeNode.Fields = {
  isLeaf: 1,
  reseved: 1,
  count: 2
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNode}
 */
bigwig.models.RTreeNode.fromArrayBuffer = function(data, littleEndian) {
  return bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeNode, bigwig.models.RTreeNode.Fields, data, littleEndian);
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNode}
 */
bigwig.models.RTreeNode.fromDataView = function(view, littleEndian) {
  return bigwig.models.BigwigStruct.fromDataView(bigwig.models.RTreeNode, bigwig.models.RTreeNode.Fields, view, littleEndian);
};

