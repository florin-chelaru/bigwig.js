/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/29/2015
 * Time: 5:34 PM
 */

goog.provide('bigwig.IndexTree');

goog.require('bigwig.Tree');
goog.require('goog.math.Long');

/**
 * @param {bigwig.IndexTree.Node} root
 * @constructor
 * @extends {bigwig.Tree}
 */
bigwig.IndexTree = function(root) {
  bigwig.Tree.apply(this, arguments);
};

goog.inherits(bigwig.IndexTree, bigwig.Tree);

/**
 * Gets all the leaves that overlap the given query range
 * @param {number} chr
 * @param {number} start
 * @param {number} end
 * @returns {Array.<bigwig.IndexTree.Node>}
 */
bigwig.IndexTree.prototype.query = function(chr, start, end) {
  var ret = [];
  this.dfs(
    /** @param {bigwig.IndexTree.Node} node */
    function(node) {
      // don't visit the rest of the subtree if the node range doesn't overlap the query range
      if (node.endChrId < chr || node.startChrId > chr) { return true; }
      if (node.startChrId == chr && node.startBase >= end || node.endChrId == chr && node.endBase <= start) { return true; }

      // get the leaves of this node
      if (node.children && node.children.length) { return false; } // continue

      ret.push(node);
  });

  return ret;
};

/**
 * @param {{
 *   isLeaf: boolean, startChrId: ?number, endChrId: ?number, startBase: ?number, endBase: ?number,
 *   children: ?Array.<bigwig.IndexTree.Node>, dataOffset: ?goog.math.Long, dataSize: ?goog.math.Long,
 *   dataRecords: ?Array.<bigwig.DataRecord>
 * }} node
 * @constructor
 * @extends {bigwig.Tree.Node}
 */
bigwig.IndexTree.Node = function(node) {
  bigwig.Tree.Node.apply(this, node);

  /**
   * @type {boolean}
   */
  this.isLeaf = node.isLeaf;

  /**
   * @type {number}
   */
  this.startChrId = node.startChrId;

  /**
   * @type {number}
   */
  this.endChrId = node.endChrId;

  /**
   * @type {number}
   */
  this.startBase = node.startBase;

  /**
   * @type {number}
   */
  this.endBase = node.endBase;

  /**
   * @type {goog.math.Long}
   */
  this.dataOffset = node.dataOffset;

  /**
   * @type {goog.math.Long}
   */
  this.dataSize = node.dataSize;

  /**
   * @type {Array.<bigwig.DataRecord>}
   */
  this.dataRecords = node.dataRecords;
};

goog.inherits(bigwig.IndexTree.Node, bigwig.Tree.Node);
