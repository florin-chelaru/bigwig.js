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
 * @param {{chr: number, start: number, end: number}} [range]
 * @returns {Array.<bigwig.IndexTree.Node>}
 */
bigwig.IndexTree.prototype.query = function(range) {
  var ret = [];
  this.dfs(/** @type {function(bigwig.Tree.Node)} */ (function(node) {
      // don't visit the rest of the subtree if the node range doesn't overlap the query range
      if (range && (node.endChrId < range['chr'] || node.startChrId > range['chr'])) { return true; }
      if (range && ((node.startChrId == range['chr'] && node.startBase >= range['end']) || (node.endChrId == range['chr'] && node.endBase <= range['start']))) { return true; }

      // get the leaves of this node
      if (node.children && node.children.length) { return false; } // continue

      ret.push(node);
  }));

  return ret;
};

/**
 * @param {{
 *   isLeaf: boolean, startChrId: (number|undefined), endChrId: (number|undefined), startBase: (number|undefined), endBase: (number|undefined),
 *   children: (Array.<bigwig.IndexTree.Node>|undefined), dataOffset: (goog.math.Long|undefined), dataSize: (goog.math.Long|undefined),
 *   dataRecords: (Array.<bigwig.DataRecord>|undefined)
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
   * @type {number|undefined}
   */
  this.startChrId = node.startChrId;

  /**
   * @type {number|undefined}
   */
  this.endChrId = node.endChrId;

  /**
   * @type {number|undefined}
   */
  this.startBase = node.startBase;

  /**
   * @type {number|undefined}
   */
  this.endBase = node.endBase;

  /**
   * @type {goog.math.Long|undefined}
   */
  this.dataOffset = node.dataOffset;

  /**
   * @type {goog.math.Long|undefined}
   */
  this.dataSize = node.dataSize;

  /**
   * @type {Array.<bigwig.DataRecord>|undefined}
   */
  this.dataRecords = node.dataRecords;
};

goog.inherits(bigwig.IndexTree.Node, bigwig.Tree.Node);
