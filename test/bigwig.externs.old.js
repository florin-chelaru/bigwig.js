/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 3/11/2016
 * Time: 6:09 PM
 */

var bigwig = {};

/**
 * @param {string} uri
 * @param {string} [fwdUri]
 * @param {number} [cacheBlockSize] Default is 512KB
 * @constructor
 */
bigwig.BigwigFile = function(uri, fwdUri, cacheBlockSize) {};

/**
 * @param {{chr: (string|number), start: number, end: number}} [range]
 * @param {{level: (number|undefined), maxItems: (number|undefined), maxBases: (number|undefined)}} [zoom]
 * @returns {Promise} Promise.<Array.<bigwig.DataRecord>>}
 */
bigwig.BigwigFile.prototype.query = function(range, zoom) {};

/**
 * @type {Promise}
 * @name bigwig.BigwigFile#initialized
 */
bigwig.BigwigFile.prototype.initialized;

/**
 * @type {{basesCovered: string, min: number, max: number, sumData: number, sumSquares: number}}
 * @name bigwig.BigwigFile#summary
 */
bigwig.BigwigFile.prototype.summary;

/**
 * @type {Array.<bigwig.ChrTree.Node>}
 * @name bigwig.BigwigFile#chromosomes
 */
bigwig.BigwigFile.prototype.chromosomes;

/**
 * @type {number}
 * @name bigwig.BigwigFile#zoomLevels
 */
bigwig.BigwigFile.prototype.zoomLevels;

/**
 * @param {bigwig.Tree.Node} [root]
 * @constructor
 */
bigwig.Tree = function(root) {};

/**
 * @param {{children: ?Array.<bigwig.Tree.Node>}} [node]
 * @constructor
 */
bigwig.Tree.Node = function(node) {};

/**
 * Iterates through all nodes of the tree; if iterate retuns true, then the
 * subtree rooted at the given node will be no longer visited
 * @param {function(bigwig.Tree.Node)} iterate
 */
bigwig.Tree.prototype.dfs = function(iterate) {};

/**
 * @param {bigwig.IndexTree.Node} root
 * @constructor
 * @extends {bigwig.Tree}
 */
bigwig.IndexTree = function(root) {};

/**
 * Gets all the leaves that overlap the given query range
 * @param {{chr: number, start: number, end: number}} [range]
 * @returns {Array.<bigwig.IndexTree.Node>}
 */
bigwig.IndexTree.prototype.query = function(range) {};

/**
 * @param {{
 *   isLeaf: boolean, startChrId: (number|undefined), endChrId: (number|undefined), startBase: (number|undefined), endBase: (number|undefined),
 *   children: (Array.<bigwig.IndexTree.Node>|undefined), dataOffset: (goog.math.Long|undefined), dataSize: (goog.math.Long|undefined),
 *   dataRecords: (Array.<bigwig.DataRecord>|undefined)
 * }} node
 * @constructor
 * @extends {bigwig.Tree.Node}
 */
bigwig.IndexTree.Node = function(node) {};

/**
 * @param {bigwig.ChrTree.Node} root
 * @constructor
 * @extends {bigwig.Tree}
 */
bigwig.ChrTree = function(root) {};

/**
 * @param {{key: (string|undefined), chrId: (number|undefined), chrSize: (number|undefined), children: (Array.<bigwig.ChrTree.Node>|undefined)}} node
 * @constructor
 * @extends {bigwig.Tree.Node}
 */
bigwig.ChrTree.Node = function(node) {};

/**
 * @param {number|string} chrIdOrKey
 * @returns {bigwig.ChrTree.Node}
 */
bigwig.ChrTree.prototype.getLeaf = function (chrIdOrKey) {};

/**
 * @type {Array.<bigwig.ChrTree.Node>}
 * @name bigwig.ChrTree#leaves
 */
bigwig.ChrTree.prototype.leaves;

/**
 * @constructor
 */
bigwig.DataRecord = function() {};

/**
 * @type {string}
 * @name bigwig.DataRecord#chrName
 */
bigwig.DataRecord.prototype.chrName;

/**
 * @type {number}
 * @name bigwig.DataRecord#chr
 */
bigwig.DataRecord.prototype.chr;

/**
 * @type {number}
 * @name bigwig.DataRecord#start
 */
bigwig.DataRecord.prototype.start;

/**
 * @type {number}
 * @name bigwig.DataRecord#end
 */
bigwig.DataRecord.prototype.end;

/**
 * @type {number}
 * @name bigwig.DataRecord#min
 */
bigwig.DataRecord.prototype.min;

/**
 * @type {number}
 * @name bigwig.DataRecord#max
 */
bigwig.DataRecord.prototype.max;

/**
 * @type {number}
 * @name bigwig.DataRecord#sum
 */
bigwig.DataRecord.prototype.sum;

/**
 * @type {number}
 * @name bigwig.DataRecord#sumsq
 */
bigwig.DataRecord.prototype.sumsq;

/**
 * @type {number}
 * @name bigwig.DataRecord#avg
 */
bigwig.DataRecord.prototype.avg;

/**
 * @type {number}
 * @name bigwig.DataRecord#norm
 */
bigwig.DataRecord.prototype.norm;

/**
 * @type {number}
 * @name bigwig.DataRecord#cnt
 */
bigwig.DataRecord.prototype.cnt;

/**
 * @enum {number}
 */
bigwig.DataRecord.Aggregate = {
  'MIN': 0,
  'MAX': 1,
  'SUM': 2,
  'SUMSQ': 3,
  'AVG': 4,
  'NORM': 5,
  'CNT': 6
};

/**
 * @param {bigwig.DataRecord.Aggregate} [aggregate]
 */
bigwig.DataRecord.prototype.value = function(aggregate) {};

/**
 * @returns {string}
 */
bigwig.DataRecord.prototype.toString = function() {};

/**
 * @returns {{chr: string, start: number, end: number, value: number}}
 */
bigwig.DataRecord.prototype.toJSON = function() {};

/**
 * @param {bigwig.IndexTree.Node} node
 * @param {bigwig.models.SectionHeader} sectionHeader
 * @param {bigwig.models.Record} rawRecord
 * @param {number} index The index of the item in the node items
 * @param {bigwig.ChrTree} [chrTree]
 * @constructor
 * @extends bigwig.DataRecord
 */
bigwig.DataRecordImpl = function(node, sectionHeader, rawRecord, index, chrTree) {};

/**
 * @param {bigwig.DataRecord.Aggregate} [aggregate]
 * @override
 */
bigwig.DataRecordImpl.prototype.value = function(aggregate) {};

/**
 * @param {bigwig.IndexTree.Node} node
 * @param {bigwig.models.ZoomRecord} zoomRecord
 * @param {bigwig.ChrTree} [chrTree]
 * @constructor
 * @extends bigwig.DataRecord
 */
bigwig.DataRecordZoom = function(node, zoomRecord, chrTree) {};

/**
 * @param {bigwig.DataRecord.Aggregate} [aggregate]
 * @override
 */
bigwig.DataRecordZoom.prototype.value = function(aggregate) {};
