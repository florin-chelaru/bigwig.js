/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 1:18 PM
 */

goog.provide('bigwig.DataRecordImpl');

goog.require('bigwig.DataRecord');
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
 * @extends bigwig.DataRecord
 */
bigwig.DataRecordImpl = function(node, sectionHeader, rawRecord, index, chrTree) {
  bigwig.DataRecord.call(this);
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
  this._chrTree = chrTree || null;
};

goog.inherits(bigwig.DataRecordImpl, bigwig.DataRecord);

Object.defineProperties(bigwig.DataRecordImpl.prototype, {

  'chrName': { get: /** @type {function (this:bigwig.DataRecordImpl)} */ (function() { return this._chrTree ? this._chrTree.getLeaf(this['chr'])['key'] : this['chr']; }) },

  'chr': { get: /** @type {function (this:bigwig.DataRecordImpl)} */ (function() { return this._sectionHeader.chrId; }) },

  'start': { get: /** @type {function (this:bigwig.DataRecordImpl)} */ (function() {
    if (this._record.chromStart != undefined) { return this._record.chromStart; }
    return this._node.startBase + this._sectionHeader.itemStep * this._index;
  })},

  'end': { get: /** @type {function (this:bigwig.DataRecordImpl)} */ (function() {
    if (this._record.chromEnd != undefined) { return this._record.chromEnd; }
    return this['start'] + this._sectionHeader.itemSpan;
  })}
});

/**
 * @param {bigwig.DataRecord.Aggregate} [aggregate]
 * @override
 */
bigwig.DataRecordImpl.prototype.value = function(aggregate) {
  var Aggregate = bigwig.DataRecord.Aggregate;
  switch (aggregate) {
    case Aggregate.SUMSQ:
      return this._record.value * this._record.value;
    case Aggregate.NORM:
      return Math.abs(this._record.value);
    case Aggregate.CNT:
      return 1;
    case Aggregate.MIN:
    case Aggregate.MAX:
    case Aggregate.SUM:
    case Aggregate.AVG:
    default:
      return this._record.value;
  }
};
