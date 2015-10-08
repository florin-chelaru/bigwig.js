/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/25/2015
 * Time: 2:25 PM
 */

goog.provide('bigwig.models.RTreeHeader');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.RTreeHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#magic
   */
  this.magic;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#blockSize
   */
  this.blockSize;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.RTreeHeader#itemCount
   */
  this.itemCount;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#startChromIx
   */
  this.startChromIx;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#startBase
   */
  this.startBase;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#endChromIx
   */
  this.endChromIx;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#endBase
   */
  this.endBase;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.RTreeHeader#endFileOffset
   */
  this.endFileOffset;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#itemsPerSlot
   */
  this.itemsPerSlot;

  /**
   * @type {number}
   * @name bigwig.models.RTreeHeader#reserved
   */
  this.reserved;
};

goog.inherits(bigwig.models.RTreeHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeHeader['Fields'] = {
  magic: 4,
  blockSize: 4,
  itemCount: 8,
  startChromIx: 4, 
  startBase: 4,
  endChromIx: 4,
  endBase: 4,
  endFileOffset: 8,
  itemsPerSlot: 4,
  reserved: 4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeHeader}
 */
bigwig.models.RTreeHeader.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.RTreeHeader} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeHeader, bigwig.models.RTreeHeader['Fields'] , data, littleEndian));
};

