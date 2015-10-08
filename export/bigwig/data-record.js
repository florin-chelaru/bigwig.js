/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 1:18 PM
 */

goog.require('bigwig.DataRecord');

goog.exportSymbol('bigwig.DataRecord', bigwig.DataRecord);

/*
Object.defineProperties(bigwig.DataRecord.prototype, {
  chrName: { get: function() { return this._chrTree ? this._chrTree.getLeaf(this.chr).key : this.chr; } },

  chr: { get: function() { return this._sectionHeader.chrId; } },

  start: { get: function() {
    if (this._record.chromStart != undefined) { return this._record.chromStart; }
    return this._node.startBase + this._sectionHeader.itemStep * this._index;
  }},

  end: { get: function() {
    if (this._record.chromEnd != undefined) { return this._record.chromEnd; }
    return this.start + this._sectionHeader.itemSpan;
  }},

  value: { get: function() { return this._record.value; } }
});

bigwig.DataRecord.prototype.toString = function() {
  return JSON.stringify(this.toJSON());
};

bigwig.DataRecord.prototype.toJSON = function() {
  return {chr: this.chrName, start: this.start, end: this.end, value: this.value};
};
*/
