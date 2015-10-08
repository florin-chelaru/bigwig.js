/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 12:44 PM
 */

goog.provide('bigwig.Tree');

/**
 * @param {bigwig.Tree.Node} [root]
 * @constructor
 */
bigwig.Tree = function(root) {
  this.root = root;
};

/**
 * @param {{children: ?Array.<bigwig.Tree.Node>}} [node]
 * @constructor
 */
bigwig.Tree.Node = function(node) {
  /**
   * @type {Array.<bigwig.Tree.Node>}
   */
  this.children = node ? node.children || null : null;
};

/**
 * Iterates through all nodes of the tree; if iterate retuns true, then the
 * subtree rooted at the given node will be no longer visited
 * @param {function(bigwig.Tree.Node)} iterate
 */
bigwig.Tree.prototype.dfs = function(iterate) {
  if (!this.root) { return; }

  /**
   * @param {bigwig.Tree.Node} node
   */
  var dfs = function(node) {
    // Break if iterate returns true
    if (iterate.call(null, node)) { return; }
    if (node.children && node.children.length) {
      node.children.forEach(dfs);
    }
  };

  dfs(this.root);
};
