/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 1:18 PM
 */

goog.provide('bigwig.DataRecord');

goog.require('bigwig.IndexTree');
goog.require('bigwig.models.SectionHeader');
goog.require('bigwig.models.Record');

/**
 * @param {bigwig.IndexTree.Node} node
 * @param {bigwig.models.SectionHeader} sectionHeader
 * @param {bigwig.models.Record} rawRecord
 * @param {number} index The index of the item in the node items
 * @param {bigwig.ChrTree} [chrTree]
 * @constructor
 */
bigwig.DataRecord = function(node, sectionHeader, rawRecord, index, chrTree) {
  /**
   * @type {bigwig.IndexTree.Node}
   * @private
   */
  this._node = node;

  /**
   * @type {bigwig.models.SectionHeader}
   * @private
   */
  this._sectionHeader = sectionHeader;

  /**
   * @type {bigwig.models.Record}
   * @private
   */
  this._record = rawRecord;

  /**
   * @type {number}
   * @private
   */
  this._index = index;

  /**
   * @type {bigwig.ChrTree}
   * @private
   */
  this._chrTree = chrTree;
};

Object.defineProperties(bigwig.DataRecord.prototype, {
  /**
   * @property
   * @type {string}
   * @name bigwig.DataRecord#chrName
   */
  'chrName': /** @type {string} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() { return this._chrTree ? this._chrTree.getLeaf(this.chr).key : this.chr; }) }),

  /**
   * @property
   * @type {number}
   * @name bigwig.DataRecord#chr
   */
  'chr': /** @type {number} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() { return this._sectionHeader.chrId; }) }),

  /**
   * @property
   * @type {number}
   * @name bigwig.DataRecord#start
   */
  'start': /** @type {number} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() {
    if (this._record.chromStart != undefined) { return this._record.chromStart; }
    return this._node.startBase + this._sectionHeader.itemStep * this._index;
  })}),

  /**
   * @property
   * @type {number}
   * @name bigwig.DataRecord#end
   */
  'end': /** @type {number} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() {
    if (this._record.chromEnd != undefined) { return this._record.chromEnd; }
    return this.start + this._sectionHeader.itemSpan;
  })}),

  /**
   * @property
   * @type {number}
   * @name bigwig.DataRecord#start
   */
  'value': /** @type {number} */ ({ get: /** @type {function (this:bigwig.DataRecord)} */ (function() { return this._record.value; }) })
});

bigwig.DataRecord.prototype.toString = function() {
  return JSON.stringify(this.toJSON());
};

bigwig.DataRecord.prototype.toJSON = function() {
  return {chr: this.chrName, start: this.start, end: this.end, value: this.value};
};
