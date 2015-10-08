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

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeLeaf#startChromIx
   */
  this.startChromIx;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeLeaf#startBase
   */
  this.startBase;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeLeaf#endChromIx
   */
  this.endChromIx;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeLeaf#endBase
   */
  this.endBase;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.RTreeNodeLeaf#dataOffset
   */
  this.dataOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.RTreeNodeLeaf#dataSize
   */
  this.dataSize;
};

goog.inherits(bigwig.models.RTreeNodeLeaf, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeNodeLeaf['Fields'] = {
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
  return /** @type {bigwig.models.RTreeNodeLeaf} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeNodeLeaf, bigwig.models.RTreeNodeLeaf['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeLeaf}
 */
bigwig.models.RTreeNodeLeaf.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.RTreeNodeLeaf} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.RTreeNodeLeaf, bigwig.models.RTreeNodeLeaf['Fields'] , view, littleEndian));
};
