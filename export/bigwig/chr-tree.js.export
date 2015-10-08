/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/29/2015
 * Time: 1:10 PM
 */

goog.provide('bigwig.ChrTree');

goog.require('bigwig.Tree');

/**
 * @param {bigwig.ChrTree.Node} root
 * @constructor
 * @extends {bigwig.Tree}
 */
bigwig.ChrTree = function(root) {
  bigwig.Tree.apply(this, arguments);

  /**
   * @type {Object.<number, bigwig.ChrTree.Node>}
   * @private
   */
  this._leavesById = null;

  /**
   * @type {Object.<string, bigwig.ChrTree.Node>}
   * @private
   */
  this._leavesByKey = null;
};

goog.inherits(bigwig.ChrTree, bigwig.Tree);

/**
 * @param {{key: string=, chrId: number=, chrSize: number=, children: Array.<bigwig.ChrTree.Node>=}} node
 * @constructor
 * @extends {bigwig.Tree.Node}
 */
bigwig.ChrTree.Node = function(node) {
  bigwig.Tree.Node.apply(this, arguments);

  /**
   * @type {string}
   */
  this.key = node.key;

  /**
   * @type {number}
   */
  this.chrId = node.chrId;

  /**
   * @type {number}
   */
  this.chrSize = node.chrSize;
};

goog.inherits(bigwig.ChrTree.Node, bigwig.Tree.Node);

/**
 * @param {number|string} chrIdOrKey
 * @returns {bigwig.ChrTree.Node}
 */
bigwig.ChrTree.prototype.getLeaf = function (chrIdOrKey) {
  if (typeof chrIdOrKey == 'number') {
    if (!this._leavesById) {
      var leavesById = {};
      this.dfs(function (node) {
        if (!node.children) {
          leavesById[node.chrId] = node;
        }
      });
      this._leavesById = leavesById;
    }
    return this._leavesById[chrIdOrKey];
  }

  // else typeof chrIdOrKey == 'string'
  if (!this._leavesByKey) {
    var leavesByKey = {};
    this.dfs(function (node) {
      if (!node.children) {
        leavesByKey[node.key] = node;
      }
    });
    this._leavesByKey = leavesByKey;
  }
  return this._leavesByKey[chrIdOrKey];
};
