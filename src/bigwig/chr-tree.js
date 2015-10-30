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
 * @param {{key: (string|undefined), chrId: (number|undefined), chrSize: (number|undefined), children: (Array.<bigwig.ChrTree.Node>|undefined)}} node
 * @constructor
 * @extends {bigwig.Tree.Node}
 */
bigwig.ChrTree.Node = function(node) {
  bigwig.Tree.Node.apply(this, arguments);

  // Export properties:
  /**
   * @type {string|undefined}
   */
  this['key'] = node.key;

  /**
   * @type {number|undefined}
   */
  this['chrId'] = node.chrId;

  /**
   * @type {number|undefined}
   */
  this['chrSize'] = node.chrSize;
};

goog.inherits(bigwig.ChrTree.Node, bigwig.Tree.Node);

/**
 * @param {number|string} chrIdOrKey
 * @returns {bigwig.ChrTree.Node}
 */
bigwig.ChrTree.prototype.getLeaf = function (chrIdOrKey) {
  if (typeof chrIdOrKey == 'number') {
    this._initializeLeavesById();
    return this._leavesById[chrIdOrKey];
  }

  // else typeof chrIdOrKey == 'string'
  this._initializeLeavesByKey();
  return this._leavesByKey[chrIdOrKey];
};

/**
 * @type {Array.<bigwig.ChrTree.Node>}
 * @name bigwig.ChrTree#leaves
 */
bigwig.ChrTree.prototype.leaves;

Object.defineProperties(bigwig.ChrTree.prototype, {
  leaves: { get: /** @type {function (this:bigwig.ChrTree)} */ (function() {
    this._initializeLeavesByKey();
    return u.map(this._leavesByKey, function(node) { return node; });
  })}
});

/**
 * @private
 */
bigwig.ChrTree.prototype._initializeLeavesByKey = function() {
  if (!this._leavesByKey) {
    var leavesByKey = {};
    this.dfs(function(node) {
      if (!node.children) {
        leavesByKey[node['key']] = node;
      }
    });
    this._leavesByKey = leavesByKey;
  }
};

/**
 * @private
 */
bigwig.ChrTree.prototype._initializeLeavesById = function() {
  if (!this._leavesById) {
    var leavesById = {};
    this.dfs(function (node) {
      if (!node.children) {
        leavesById[node['chrId']] = node;
      }
    });
    this._leavesById = leavesById;
  }
};