/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/13/2015
 * Time: 7:14 PM
 */

goog.provide('bigwig.DataRecordZoom');

goog.require('bigwig.DataRecord');
goog.require('bigwig.IndexTree');
goog.require('bigwig.models.ZoomRecord');

/**
 * @param {bigwig.IndexTree.Node} node
 * @param {bigwig.models.ZoomRecord} zoomRecord
 * @param {bigwig.ChrTree} [chrTree]
 * @constructor
 * @extends bigwig.DataRecord
 */
bigwig.DataRecordZoom = function(node, zoomRecord, chrTree) {
  bigwig.DataRecord.call(this);
  /**
   * @type {bigwig.IndexTree.Node}
   * @private
   */
  this._node = node;

  /**
   * @type {bigwig.models.ZoomRecord}
   * @private
   */
  this._record = zoomRecord;

  /**
   * @type {bigwig.ChrTree}
   * @private
   */
  this._chrTree = chrTree || null;
};

goog.inherits(bigwig.DataRecordZoom, bigwig.DataRecord);

Object.defineProperties(bigwig.DataRecordZoom.prototype, {

  'chrName': { get: /** @type {function (this:bigwig.DataRecordZoom)} */ (function() { return this._chrTree ? this._chrTree.getLeaf(this['chr'])['key'] : this['chr']; }) },

  'chr': { get: /** @type {function (this:bigwig.DataRecordZoom)} */ (function() { return this._record.chrId; }) },

  'start': { get: /** @type {function (this:bigwig.DataRecordZoom)} */ (function() { return this._record.start; })},

  'end': { get: /** @type {function (this:bigwig.DataRecordZoom)} */ (function() { return this._record.end; })},

  'value': { get: /** @type {function (this:bigwig.DataRecordZoom)} */ (function() { return this._record.sumData / this._record.validCount; }) }
});
