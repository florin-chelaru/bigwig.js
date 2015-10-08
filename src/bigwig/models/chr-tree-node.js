/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 4:15 PM
 */

goog.provide('bigwig.models.ChrTreeNode');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeNode = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNode#isLeaf
   */
  this.isLeaf;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNode#reserved
   */
  this.reserved;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNode#count
   */
  this.count;
};

goog.inherits(bigwig.models.ChrTreeNode, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ChrTreeNode['Fields'] = {
  isLeaf: 1,
  reserved: 1,
  count: 2
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNode}
 */
bigwig.models.ChrTreeNode.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNode} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeNode, bigwig.models.ChrTreeNode['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNode}
 */
bigwig.models.ChrTreeNode.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNode} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.ChrTreeNode, bigwig.models.ChrTreeNode['Fields'] , view, littleEndian));
};
