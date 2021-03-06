/**
* @license bigwig.js
* Copyright (c) 2015 Florin Chelaru
* License: MIT
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
* Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
* COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


goog.provide('bigwig.BigwigException');

/**
 * @param {string} message
 * @param {Error} [innerException]
 * @constructor
 * @extends u.Exception
 */
bigwig.BigwigException = function(message, innerException) {
  u.Exception.apply(this, arguments);

  /**
   * @type {string}
   */
  this.name = 'BigwigException';
};

goog.inherits(bigwig.BigwigException, u.Exception);



goog.provide('bigwig.models.BigwigStruct');

goog.require('bigwig.BigwigException');
goog.require('goog.math.Long');

/**
 * @param {Object.<string, *>} values
 * @constructor
 */
bigwig.models.BigwigStruct = function(values) {
  var self = this;
  u.each(values, function(field, value) {
    self[field] = value;
  });
};

/**
 * @returns {string}
 */
bigwig.models.BigwigStruct.prototype.toString = function() {
  return JSON.stringify(this, function(k, v) {
    if (v instanceof goog.math.Long) {
      if (v.getHighBits() == 0) { return v.getLowBitsUnsigned(); }
      return v.toString();
    }
    return v;
  });
};

/**
 * @param {function(new: bigwig.models.BigwigStruct)} bigwigType
 * @param {Object.<string, number>} fields
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.BigwigStruct}
 */
bigwig.models.BigwigStruct.fromArrayBuffer = function(bigwigType, fields, data, littleEndian) {
  var view = new DataView(data);
  return bigwig.models.BigwigStruct.fromDataView(bigwigType, fields, view, littleEndian);
};

/**
 * @param {function(new: bigwig.models.BigwigStruct)} bigwigType
 * @param {Object.<string, number>} fields
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.BigwigStruct}
 */
bigwig.models.BigwigStruct.fromDataView = function(bigwigType, fields, view, littleEndian) {
  var bigEndian = !littleEndian;

  var ret = {};
  var offset = 0;
  var buf;
  u.each(fields, function(field, size) {
    var val;
    switch (size) {
      case 8:
        var first = view.getUint32(offset, !bigEndian);
        var second = view.getUint32(offset + 4, !bigEndian);
        val = bigEndian ? new goog.math.Long(second, first) : new goog.math.Long(first, second);
        break;
      case 4:
        val = view.getUint32(offset, !bigEndian);
        break;
      case 2:
        val = view.getUint16(offset, !bigEndian);
        break;
      case 1:
        val = view.getUint8(offset);
        break;
      case -8:
        val = view.getFloat64(offset, !bigEndian);
        break;
      case -4:
        val = view.getFloat32(offset, !bigEndian);
        break;
      case 0:
        // Zero-terminated string
        buf = [];
        for (; offset < view.byteLength && (buf.length == 0 || buf[buf.length-1] != 0); ++offset) {
          buf.push(view.getUint8(offset));
        }
        val = String.fromCharCode.apply(null, buf);
        break;
      default:
        buf = new Uint8Array(view.buffer, view.byteOffset + offset, size);
        var zeroIndex = buf.indexOf(0);
        if (zeroIndex >= 0) {
          buf = buf.subarray(0, zeroIndex);
        }
        val = String.fromCharCode.apply(null, buf);
        break;
    }
    offset += Math.abs(size);
    ret[field] = val;
  });

  return u.reflection.applyConstructor(bigwigType, [ret]);
};

/**
 * @param {function(new: bigwig.models.BigwigStruct)} bigwigType
 * @param {Object.<string, number>} [fields]
 * @returns {number}
 */
bigwig.models.BigwigStruct.sizeOf = function(bigwigType, fields) {
  var ret = 0;
  var f = fields || bigwigType['Fields'] ;
  if (!f) { throw new bigwig.BigwigException('Cannot compute size of type (fields not defined)'); }
  u.each(f, function(field, size) {
    ret += Math.abs(size);
  });
  return ret;
};




goog.provide('bigwig.models.SectionHeader');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.SectionHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#chrId
   */
  this.chrId;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#start
   */
  this.start;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#end
   */
  this.end;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#itemStep
   */
  this.itemStep;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#itemSpan
   */
  this.itemSpan;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#type
   */
  this.type;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#reserved
   */
  this.reserved;

  /**
   * @type {number}
   * @name bigwig.models.SectionHeader#itemCount
   */
  this.itemCount;
};

goog.inherits(bigwig.models.SectionHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.SectionHeader['Fields'] = {
  chrId: 4,
  start: 4,
  end: 4,
  itemStep: 4,
  itemSpan: 4,
  type: 1,
  reserved: 1,
  itemCount: 2
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.SectionHeader}
 */
bigwig.models.SectionHeader.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.SectionHeader} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.SectionHeader, bigwig.models.SectionHeader['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.SectionHeader}
 */
bigwig.models.SectionHeader.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.SectionHeader} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.SectionHeader, bigwig.models.SectionHeader['Fields'] , view, littleEndian));
};


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
      u.fast.forEach(node.children, dfs);
    }
  };

  dfs(this.root);
};


goog.provide('bigwig.IndexTree');

goog.require('bigwig.Tree');
goog.require('goog.math.Long');

/**
 * @param {bigwig.IndexTree.Node} root
 * @constructor
 * @extends {bigwig.Tree}
 */
bigwig.IndexTree = function(root) {
  bigwig.Tree.apply(this, arguments);
};

goog.inherits(bigwig.IndexTree, bigwig.Tree);

/**
 * Gets all the leaves that overlap the given query range
 * @param {{chr: number, start: number, end: number}} [range]
 * @returns {Array.<bigwig.IndexTree.Node>}
 */
bigwig.IndexTree.prototype.query = function(range) {
  var ret = [];
  this.dfs(/** @type {function(bigwig.Tree.Node)} */ (function(node) {
      // don't visit the rest of the subtree if the node range doesn't overlap the query range
      if (range && (node.endChrId < range['chr'] || node.startChrId > range['chr'])) { return true; }
      if (range && ((node.startChrId == range['chr'] && node.startBase >= range['end']) || (node.endChrId == range['chr'] && node.endBase <= range['start']))) { return true; }

      // get the leaves of this node
      if (node.children && node.children.length) { return false; } // continue

      ret.push(node);
  }));

  return ret;
};

/**
 * @param {{
 *   isLeaf: boolean, startChrId: (number|undefined), endChrId: (number|undefined), startBase: (number|undefined), endBase: (number|undefined),
 *   children: (Array.<bigwig.IndexTree.Node>|undefined), dataOffset: (goog.math.Long|undefined), dataSize: (goog.math.Long|undefined),
 *   dataRecords: (Array.<bigwig.DataRecord>|undefined)
 * }} node
 * @constructor
 * @extends {bigwig.Tree.Node}
 */
bigwig.IndexTree.Node = function(node) {
  bigwig.Tree.Node.apply(this, node);

  /**
   * @type {boolean}
   */
  this.isLeaf = node.isLeaf;

  /**
   * @type {number|undefined}
   */
  this.startChrId = node.startChrId;

  /**
   * @type {number|undefined}
   */
  this.endChrId = node.endChrId;

  /**
   * @type {number|undefined}
   */
  this.startBase = node.startBase;

  /**
   * @type {number|undefined}
   */
  this.endBase = node.endBase;

  /**
   * @type {goog.math.Long|undefined}
   */
  this.dataOffset = node.dataOffset;

  /**
   * @type {goog.math.Long|undefined}
   */
  this.dataSize = node.dataSize;

  /**
   * @type {Array.<bigwig.DataRecord>|undefined}
   */
  this.dataRecords = node.dataRecords;
};

goog.inherits(bigwig.IndexTree.Node, bigwig.Tree.Node);


goog.provide('bigwig.DataRecord');

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

Object.defineProperties(bigwig.DataRecord.prototype, {
  'min': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['MIN'])
    })
  },
  'max': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['MAX'])
    })
  },

  'sum': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['SUM'])
    })
  },

  'avg': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['AVG'])
    })
  },

  'sumsq': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['SUMSQ'])
    })
  },

  'norm': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['NORM'])
    })
  },

  'cnt': {
    get: /** @type {function (this:bigwig.DataRecord)} */ (function () {
      return this.value(bigwig.DataRecord.Aggregate['CNT'])
    })
  }
});

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
bigwig.DataRecord.prototype.value = function(aggregate) {
  throw new bigwig.BigwigException('Abstract method not implemented');
};

/**
 * @returns {string}
 */
bigwig.DataRecord.prototype.toString = function() {
  return JSON.stringify(this.toJSON());
};

/**
 * @returns {{chr: string, start: number, end: number, value: number}}
 */
bigwig.DataRecord.prototype.toJSON = function() {
  return {'chr': this['chrName'], 'start': this['start'], 'end': this['end'], 'value': this['value']};
};


goog.provide('bigwig.models.Record');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.Record = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.Record#value
   */
  this.value;
};

goog.inherits(bigwig.models.Record, bigwig.models.BigwigStruct);


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
    case Aggregate['SUMSQ']:
      return this._record.value * this._record.value;
    case Aggregate['NORM']:
      return Math.abs(this._record.value);
    case Aggregate['CNT']:
      return 1;
    case Aggregate['MIN']:
    case Aggregate['MAX']:
    case Aggregate['SUM']:
    case Aggregate['AVG']:
    default:
      return this._record.value;
  }
};


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



goog.provide('bigwig.models.VariableStepRecord');

goog.require('bigwig.models.Record');

/**
 * @constructor
 * @extends {bigwig.models.Record}
 */
bigwig.models.VariableStepRecord = function() {
  bigwig.models.Record.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.VariableStepRecord#chromStart
   */
  this.chromStart;
};

goog.inherits(bigwig.models.VariableStepRecord, bigwig.models.Record);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.VariableStepRecord['Fields'] = {
  chromStart: 4,
  value: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.VariableStepRecord}
 */
bigwig.models.VariableStepRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.VariableStepRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.VariableStepRecord, bigwig.models.VariableStepRecord['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.VariableStepRecord}
 */
bigwig.models.VariableStepRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.VariableStepRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.VariableStepRecord, bigwig.models.VariableStepRecord['Fields'] , view, littleEndian));
};





goog.provide('bigwig.models.ChrTreeNodeItem');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeNodeItem = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {string}
   * @name bigwig.models.ChrTreeNodeItem#key
   */
  this.key;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.ChrTreeNodeItem#childOffset
   */
  this.childOffset;
};

goog.inherits(bigwig.models.ChrTreeNodeItem, bigwig.models.BigwigStruct);

/**
 * @param {ArrayBuffer} data
 * @param {number} keySize
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNodeItem}
 */
bigwig.models.ChrTreeNodeItem.fromArrayBuffer = function(data, keySize, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNodeItem} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeNodeItem, {key: keySize, childOffset: 8}, data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {number} keySize
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNodeItem}
 */
bigwig.models.ChrTreeNodeItem.fromDataView = function(view, keySize, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNodeItem} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.ChrTreeNodeItem, {key: keySize, childOffset: 8}, view, littleEndian));
};


goog.provide('bigwig.models.ZoomRecord');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ZoomRecord = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#chrId
   */
  this.chrId;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#start
   */
  this.start;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#end
   */
  this.end;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#validCount
   */
  this.validCount;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#minVal
   */
  this.minVal;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#maxVal
   */
  this.maxVal;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#sumData
   */
  this.sumData;

  /**
   * @type {number}
   * @name bigwig.models.ZoomRecord#sumSquares
   */
  this.sumSquares;
};

goog.inherits(bigwig.models.ZoomRecord, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ZoomRecord['Fields'] = {
  chrId: 4,
  start: 4,
  end: 4,
  validCount: 4,
  minVal: -4,
  maxVal: -4,
  sumData: -4,
  sumSquares: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ZoomRecord}
 */
bigwig.models.ZoomRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ZoomRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ZoomRecord, bigwig.models.ZoomRecord['Fields'], data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ZoomRecord}
 */
bigwig.models.ZoomRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.ZoomRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.ZoomRecord, bigwig.models.ZoomRecord['Fields'], view, littleEndian));
};


goog.provide('bigwig.models.RTreeNode');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.RTreeNode = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.RTreeNode#isLeaf
   */
  this.isLeaf;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNode#reserved
   */
  this.reserved;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNode#count
   */
  this.count;
};

goog.inherits(bigwig.models.RTreeNode, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeNode['Fields'] = {
  isLeaf: 1,
  reserved: 1,
  count: 2
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNode}
 */
bigwig.models.RTreeNode.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.RTreeNode} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeNode, bigwig.models.RTreeNode['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNode}
 */
bigwig.models.RTreeNode.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.RTreeNode} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.RTreeNode, bigwig.models.RTreeNode['Fields'] , view, littleEndian));
};



goog.provide('bigwig.models.ChrTreeNode');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeNode = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNode#isLeaf
   */
  this.isLeaf;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNode#reserved
   */
  this.reserved;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNode#count
   */
  this.count;
};

goog.inherits(bigwig.models.ChrTreeNode, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ChrTreeNode['Fields'] = {
  isLeaf: 1,
  reserved: 1,
  count: 2
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNode}
 */
bigwig.models.ChrTreeNode.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNode} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeNode, bigwig.models.ChrTreeNode['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNode}
 */
bigwig.models.ChrTreeNode.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNode} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.ChrTreeNode, bigwig.models.ChrTreeNode['Fields'] , view, littleEndian));
};


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


goog.provide('bigwig.models.BedGraphRecord');

goog.require('bigwig.models.Record');

/**
 * @constructor
 * @extends {bigwig.models.Record}
 */
bigwig.models.BedGraphRecord = function() {
  bigwig.models.Record.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.BedGraphRecord#chromStart
   */
  this.chromStart;

  /**
   * @type {number}
   * @name bigwig.models.BedGraphRecord#chromEnd
   */
  this.chromEnd;
};

goog.inherits(bigwig.models.BedGraphRecord, bigwig.models.Record);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.BedGraphRecord['Fields'] = {
  chromStart: 4,
  chromEnd: 4,
  value: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.BedGraphRecord}
 */
bigwig.models.BedGraphRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.BedGraphRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.BedGraphRecord, bigwig.models.BedGraphRecord['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.BedGraphRecord}
 */
bigwig.models.BedGraphRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.BedGraphRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.BedGraphRecord, bigwig.models.BedGraphRecord['Fields'] , view, littleEndian));
};





goog.provide('bigwig.models.ChrTreeHeader');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeHeader#magic
   */
  this.magic;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeHeader#blockSize
   */
  this.blockSize;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeHeader#keySize
   */
  this.keySize;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeHeader#valSize
   */
  this.valSize;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.ChrTreeHeader#itemCount
   */
  this.itemCount;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.ChrTreeHeader#reserved
   */
  this.reserved;
};

goog.inherits(bigwig.models.ChrTreeHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ChrTreeHeader['Fields'] = {
  magic: 4,
  blockSize: 4,
  keySize: 4,
  valSize: 4,
  itemCount: 8,
  reserved: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeHeader}
 */
bigwig.models.ChrTreeHeader.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ChrTreeHeader} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeHeader, bigwig.models.ChrTreeHeader['Fields'] , data, littleEndian));
};



goog.provide('bigwig.models.ChrTreeNodeLeaf');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ChrTreeNodeLeaf = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {string}
   * @name bigwig.models.ChrTreeNodeLeaf#key
   */
  this.key;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNodeLeaf#chrId
   */
  this.chrId;

  /**
   * @type {number}
   * @name bigwig.models.ChrTreeNodeLeaf#chrSize
   */
  this.chrSize;
};

goog.inherits(bigwig.models.ChrTreeNodeLeaf, bigwig.models.BigwigStruct);

/**
 * @param {ArrayBuffer} data
 * @param {number} keySize
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNodeLeaf}
 */
bigwig.models.ChrTreeNodeLeaf.fromArrayBuffer = function(data, keySize, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNodeLeaf} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ChrTreeNodeLeaf, {key: keySize, chrId: 4, chrSize: 4}, data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {number} keySize
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ChrTreeNodeLeaf}
 */
bigwig.models.ChrTreeNodeLeaf.fromDataView = function(view, keySize, littleEndian) {
  return /** @type {bigwig.models.ChrTreeNodeLeaf} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.ChrTreeNodeLeaf, {key: keySize, chrId: 4, chrSize: 4}, view, littleEndian));
};


goog.provide('bigwig.models.RTreeNodeItem');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.RTreeNodeItem = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeItem#startChromIx
   */
  this.startChromIx;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeItem#startBase
   */
  this.startBase;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeItem#endChromIx
   */
  this.endChromIx;

  /**
   * @type {number}
   * @name bigwig.models.RTreeNodeItem#endBase
   */
  this.endBase;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.RTreeNodeItem#dataOffset
   */
  this.dataOffset;
};

goog.inherits(bigwig.models.RTreeNodeItem, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.RTreeNodeItem['Fields'] = {
  startChromIx: 4,
  startBase: 4,
  endChromIx: 4,
  endBase: 4,
  dataOffset: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeItem}
 */
bigwig.models.RTreeNodeItem.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.RTreeNodeItem} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.RTreeNodeItem, bigwig.models.RTreeNodeItem['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.RTreeNodeItem}
 */
bigwig.models.RTreeNodeItem.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.RTreeNodeItem} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.RTreeNodeItem, bigwig.models.RTreeNodeItem['Fields'] , view, littleEndian));
};


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


goog.provide('bigwig.models.FixedStepRecord');

goog.require('bigwig.models.Record');

/**
 * @constructor
 * @extends {bigwig.models.Record}
 */
bigwig.models.FixedStepRecord = function() {
  bigwig.models.Record.apply(this, arguments);
};

goog.inherits(bigwig.models.FixedStepRecord, bigwig.models.Record);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.FixedStepRecord['Fields'] = {
  value: -4
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.FixedStepRecord}
 */
bigwig.models.FixedStepRecord.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.FixedStepRecord} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.FixedStepRecord, bigwig.models.FixedStepRecord['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.FixedStepRecord}
 */
bigwig.models.FixedStepRecord.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.FixedStepRecord} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.FixedStepRecord, bigwig.models.FixedStepRecord['Fields'] , view, littleEndian));
};





goog.provide('bigwig.models.TotalSummary');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.TotalSummary = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.TotalSummary#basesCovered
   */
  this.basesCovered;

  /**
   * @type {number}
   * @name bigwig.models.TotalSummary#minVal
   */
  this.minVal;

  /**
   * @type {number}
   * @name bigwig.models.TotalSummary#maxVal
   */
  this.maxVal;

  /**
   * @type {number}
   * @name bigwig.models.TotalSummary#sumData
   */
  this.sumData;

  /**
   * @type {number}
   * @name bigwig.models.TotalSummary#sumSquares
   */
  this.sumSquares;
};

goog.inherits(bigwig.models.TotalSummary, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.TotalSummary['Fields'] = {
  basesCovered: 8,
  minVal: -8,
  maxVal: -8,
  sumData: -8,
  sumSquares: -8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.TotalSummary}
 */
bigwig.models.TotalSummary.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.TotalSummary} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.TotalSummary, bigwig.models.TotalSummary['Fields'] , data, littleEndian));
};


goog.provide('bigwig.models.ZoomHeader');

goog.require('bigwig.models.BigwigStruct');

/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.ZoomHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.ZoomHeader#reductionLevel
   */
  this.reductionLevel;

  /**
   * @type {number}
   * @name bigwig.models.ZoomHeader#reserved
   */
  this.reserved;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.ZoomHeader#dataOffset
   */
  this.dataOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.ZoomHeader#indexOffset
   */
  this.indexOffset;
};

goog.inherits(bigwig.models.ZoomHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.ZoomHeader['Fields'] = {
  reductionLevel: 4,
  reserved: 4,
  dataOffset: 8,
  indexOffset: 8
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.ZoomHeader}
 */
bigwig.models.ZoomHeader.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.ZoomHeader} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.ZoomHeader, bigwig.models.ZoomHeader['Fields'] , data, littleEndian));
};


goog.provide('bigwig.models.Header');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.Header = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);

  /**
   * @type {number}
   * @name bigwig.models.Header#magic
   */
  this.magic;

  /**
   * @type {number}
   * @name bigwig.models.Header#version
   */
  this.version;

  /**
   * @type {number}
   * @name bigwig.models.Header#zoomLevels
   */
  this.zoomLevels;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#chromosomeTreeOffset
   */
  this.chromosomeTreeOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#fullDataOffset
   */
  this.fullDataOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#fullIndexOffset
   */
  this.fullIndexOffset;

  /**
   * @type {number}
   * @name bigwig.models.Header#fieldCount
   */
  this.fieldCount;

  /**
   * @type {number}
   * @name bigwig.models.Header#definedFieldCount
   */
  this.definedFieldCount;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#autoSqlOffset
   */
  this.autoSqlOffset;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#totalSummaryOffset
   */
  this.totalSummaryOffset;

  /**
   * @type {number}
   * @name bigwig.models.Header#uncompressedBufSize
   */
  this.uncompressedBufSize;

  /**
   * @type {goog.math.Long}
   * @name bigwig.models.Header#reserved
   */
  this.reserved;
};

goog.inherits(bigwig.models.Header, bigwig.models.BigwigStruct);

/**
 * @type {boolean}
 * @name bigwig.models.Header#bigEndian
 */
bigwig.models.Header.prototype.bigEndian;

/**
 * @type {boolean}
 * @name bigwig.models.Header#littleEndian
 */
bigwig.models.Header.prototype.littleEndian;

Object.defineProperties(bigwig.models.Header.prototype, {
  bigEndian: { get: /** @type {function (this:bigwig.models.Header)} */ (function() { return this.magic == 0x888FFC26; }) },
  littleEndian: { get: /** @type {function (this:bigwig.models.Header)} */ (function() { return !this.bigEndian; }) }
});

/**
 * @type {Object.<string, number>}
 */
bigwig.models.Header['Fields'] = {
  magic: 4,
  version: 2,
  zoomLevels: 2,
  chromosomeTreeOffset: 8,
  fullDataOffset: 8,
  fullIndexOffset: 8,
  fieldCount: 2,
  definedFieldCount: 2,
  autoSqlOffset: 8,
  totalSummaryOffset: 8,
  uncompressedBufSize: 4,
  reserved: 8
};

/**
 * @param {ArrayBuffer} data
 * @returns {bigwig.models.Header}
 */
bigwig.models.Header.fromArrayBuffer = function(data) {
  var view = new DataView(data);

  var magic = view.getUint32(0);
  var bigEndian = magic == 0x888FFC26;

  var header = /** @type {bigwig.models.Header} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.Header, bigwig.models.Header['Fields'] , data, !bigEndian));
  header.magic = magic;

  return header;
};


goog.provide('bigwig.BigwigReader');

goog.require('goog.math.Long');
goog.require('goog.string.format');

goog.require('bigwig.models.BigwigStruct');
goog.require('bigwig.models.Header');
goog.require('bigwig.models.ZoomHeader');
goog.require('bigwig.models.TotalSummary');
goog.require('bigwig.models.ChrTreeHeader');
goog.require('bigwig.models.ChrTreeNode');
goog.require('bigwig.models.ChrTreeNodeItem');
goog.require('bigwig.models.ChrTreeNodeLeaf');
goog.require('bigwig.models.SectionHeader');
goog.require('bigwig.models.RTreeHeader');
goog.require('bigwig.models.RTreeNode');
goog.require('bigwig.models.RTreeNodeItem');
goog.require('bigwig.models.RTreeNodeLeaf');
goog.require('bigwig.models.FixedStepRecord');
goog.require('bigwig.models.VariableStepRecord');
goog.require('bigwig.models.BedGraphRecord');
goog.require('bigwig.models.ZoomRecord');

goog.require('bigwig.ChrTree');

/**
 * @param {string} uri
 * @param {string} [fwdUri]
 * @param {number} [cacheSize] Default is 512KB
 * @constructor
 */
bigwig.BigwigReader = function(uri, fwdUri, cacheSize) {
  /**
   * @type {string}
   * @private
   */
  this._uri = uri;

  /**
   * @type {?string}
   * @private
   */
  this._fwdUri = fwdUri || null;

  /**
   * @type {goog.math.Long}
   * @private
   */
  this._fileSize = null;

  var self = this;

  /**
   * @type {Promise}
   * @private
   */
  this._fileSizePromise = new Promise(function(resolve, reject) {
    if (self._fileSize != undefined) { resolve(self._fileSize); return; }
    self.get(0, 1, function(response, xhr) {
      var rangeHeader = xhr.getResponseHeader('Content-Range');
      self._fileSize = goog.math.Long.fromString(rangeHeader.substr(rangeHeader.indexOf('/') + 1));
      resolve(self._fileSize);
    });
  });

  /**
   * @type {number}
   * @private
   */
  this._cacheSize = (cacheSize && cacheSize > 0) ? cacheSize * 1024 : bigwig.BigwigReader.CACHE_BLOCK_SIZE;

  /**
   * @type {Function}
   * @private
   */
  this._get = (cacheSize === 0) ? this.get : this.getCached;

  /**
   * @type {Object.<string, Promise>}
   * @private
   */
  this._cache = {};
};

bigwig.BigwigReader.N_RETRIES = 10;

bigwig.BigwigReader.CACHE_BLOCK_SIZE = 1024 * 512;

/**
 * @const {number}
 */
bigwig.BigwigReader.HEADER_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.Header);

/**
 * @const {number}
 */
bigwig.BigwigReader.ZOOM_HEADER_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.ZoomHeader);

/**
 * @const {number}
 */
bigwig.BigwigReader.TOTAL_SUMMARY_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.TotalSummary);

/**
 * @const {number}
 */
bigwig.BigwigReader.CHR_TREE_HEADER_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.ChrTreeHeader);

/**
 * @const {number}
 */
bigwig.BigwigReader.CHR_TREE_NODE_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.ChrTreeNode);

/**
 * @const {number}
 */
bigwig.BigwigReader.R_TREE_HEADER_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.RTreeHeader);

/**
 * @const {number}
 */
bigwig.BigwigReader.R_TREE_NODE_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.RTreeNode);

/**
 * @const {number}
 */
bigwig.BigwigReader.R_TREE_NODE_ITEM_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.RTreeNodeItem);

/**
 * @const {number}
 */
bigwig.BigwigReader.R_TREE_NODE_LEAF_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.RTreeNodeLeaf);

/**
 * @const {number}
 */
bigwig.BigwigReader.SECTION_HEADER_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.SectionHeader);

/**
 * @const {number}
 */
bigwig.BigwigReader.ZOOM_RECORD_SIZE = bigwig.models.BigwigStruct.sizeOf(bigwig.models.ZoomRecord);

/**
 * @type {Object.<number, Array>}
 */
bigwig.BigwigReader.RECORD_TYPES = {
  1: [bigwig.models.BedGraphRecord, bigwig.models.BedGraphRecord.fromDataView, bigwig.models.BedGraphRecord.fromArrayBuffer],
  2: [bigwig.models.VariableStepRecord, bigwig.models.VariableStepRecord.fromDataView, bigwig.models.VariableStepRecord.fromArrayBuffer],
  3: [bigwig.models.FixedStepRecord, bigwig.models.FixedStepRecord.fromDataView, bigwig.models.FixedStepRecord.fromArrayBuffer]
};

/**
 * @param {number|goog.math.Long} start
 * @param {number|goog.math.Long} end
 * @param {function(ArrayBuffer, XMLHttpRequest)} callback
 */
bigwig.BigwigReader.prototype.get = function(start, end, callback) {
  var self = this;
  var retriesLeft = bigwig.BigwigReader.N_RETRIES;
  var s = /** @type {string|number} */ ((start instanceof goog.math.Long) ? start.toString() : start);
  var e = /** @type {string|number} */ ((end instanceof goog.math.Long) ? end.subtract(goog.math.Long.fromInt(1)).toString() : end - 1);
  var uri = this._fwdUri ? goog.string.format('%s?r=%s-%s&q=%s', this._fwdUri, s, e, this._uri)  : this._uri;

  var retry = function() {
    var req = new XMLHttpRequest();
    req.open('GET', uri, true);
    if (!self._fwdUri) { req.setRequestHeader('Range', goog.string.format('bytes=%s-%s', s, e)); }
    req.responseType = 'arraybuffer';
    req.onload = function(e) {
      callback(e.target.response, e.target);
    };
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200 || req.status == 206) {
        } else {
          --retriesLeft;
          if (retriesLeft) {
            console.log('Failed: Range ' + goog.string.format('bytes=%s-%s', s, e) + '; retrying...');
            retry();
          } else {
            console.error('Failed: Range ' + goog.string.format('bytes=%s-%s', s, e));
          }
        }
      }
    };
    req.send();
  };

  retry();
};

bigwig.BigwigReader.prototype.getFileSize = function() {
  return this._fileSizePromise;
};

/**
 * @param {number|goog.math.Long} start
 * @param {number|goog.math.Long} end
 * @param {function(ArrayBuffer)} callback
 */
bigwig.BigwigReader.prototype.getCached = function(start, end, callback) {
  var self = this;

  if (self._fileSize == undefined) {
    self.getFileSize()
      .then(function() {
        self.getCached(start, end, callback);
      });
    return;
  }

  var lStart = (start instanceof goog.math.Long) ? start : goog.math.Long.fromNumber(/** @type {number} */(start));
  var lEnd = (end instanceof goog.math.Long) ? end : goog.math.Long.fromNumber(/** @type {number} */(end));

  var blockSize = goog.math.Long.fromNumber(this._cacheSize);
  var startBl = lStart.div(blockSize);
  var endBl = lEnd.div(blockSize);
  var s = startBl.multiply(blockSize);
  var e = s.add(blockSize);
  if (!startBl.equals(endBl)) {
    self.get(start, end, callback);
    return;
  }

  var b = startBl.toString();
  var promise = this._cache[b];
  if (!promise) {
    promise = new Promise(function(resolve, reject) {
      if (e.greaterThan(self._fileSize)) {
        e = self._fileSize;
      }
      self.get(s, e, function(buf) {
        resolve(buf);
      });
    });
    this._cache[b] = promise;
  }
  promise.then(function(buf) {
    var begin = lStart.subtract(s).toNumber();
    var end = lEnd.subtract(s).toNumber();
    callback(buf.slice(begin, end));
  });
};

/**
 * @returns {Promise} Promise.<bigwig.models.Header>
 */
bigwig.BigwigReader.prototype.readHeader = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._get(0, bigwig.BigwigReader.HEADER_SIZE, function(buf) {
      var header = bigwig.models.Header.fromArrayBuffer(buf);
      resolve(header);
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {number} index
 * @returns {Promise} Promise.<bigwig.models.ZoomHeader>
 */
bigwig.BigwigReader.prototype.readZoomHeader = function(header, index) {
  if (index >= header.zoomLevels || index < 0) { throw new bigwig.BigwigException('Bigwig: invalid zoom index'); }
  var self = this;
  return new Promise(function(resolve, reject) {
    var offset = bigwig.BigwigReader.HEADER_SIZE;
    var zoomHeaderSize = bigwig.BigwigReader.ZOOM_HEADER_SIZE;
    self._get(offset + index * zoomHeaderSize, offset + (index + 1) * zoomHeaderSize, function(buf) {
      var ret = bigwig.models.ZoomHeader.fromArrayBuffer(buf, header.littleEndian);
      resolve(ret);
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise} Promise.<Array.<bigwig.models.ZoomHeader>
 */
bigwig.BigwigReader.prototype.readZoomHeaders = function(header) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var zoomHeaders = new Array(header.zoomLevels);
    u.async.for(header.zoomLevels, function(i) {
      return new Promise(function(itResolve, itReject) {
        self.readZoomHeader(header, i)
          .then(function(d) { zoomHeaders[i] = d; itResolve(); });
      });

    }).then(function() { resolve(zoomHeaders); });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise} Promise.<bigwig.models.TotalSummary>
 */
bigwig.BigwigReader.prototype.readTotalSummary = function(header) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var offset =
      bigwig.BigwigReader.HEADER_SIZE +
      bigwig.BigwigReader.ZOOM_HEADER_SIZE * header.zoomLevels;
    self._get(offset, offset + bigwig.BigwigReader.TOTAL_SUMMARY_SIZE, function(buf) {
      var ret = bigwig.models.TotalSummary.fromArrayBuffer(buf, header.littleEndian);
      resolve(ret);
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise} Promise.<bigwig.models.ChrTreeHeader>
 */
bigwig.BigwigReader.prototype.readChrTreeHeader = function(header) {
  var self = this;
  return new Promise(function(resolve, reject) {
    /** @type {goog.math.Long} */
    var offset = header.chromosomeTreeOffset;
    self._get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.CHR_TREE_HEADER_SIZE)), function(buf) {
      var ret = bigwig.models.ChrTreeHeader.fromArrayBuffer(buf, header.littleEndian);
      resolve(ret);
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {goog.math.Long} offset
 * @returns {Promise} Promise.<bigwig.models.ChrTreeNode>
 */
bigwig.BigwigReader.prototype.readChrTreeNode = function(header, offset) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.CHR_TREE_NODE_SIZE)), function (buf) {
      var ret = bigwig.models.ChrTreeNode.fromArrayBuffer(buf, header.littleEndian);
      resolve(ret);
    });
  });
};

/**
 * TODO: Expand once we find a bigwig file with more than one level in the tree
 * @param {bigwig.models.Header} header
 * @param {bigwig.models.ChrTreeHeader} treeHeader
 * @param {goog.math.Long} offset
 * @returns {Promise} Promise.<{node: bigwig.models.ChrTreeNode, items: Array.<bigwig.models.ChrTreeNodeItem|bigwig.models.ChrTreeNodeLeaf>}>
 */
bigwig.BigwigReader.prototype.readChrTreeNodeItems = function(header, treeHeader, offset) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var itemSize = treeHeader.keySize + 8;
    var nodeSize = bigwig.BigwigReader.CHR_TREE_NODE_SIZE;
    // TODO: There may be a bug here: treeHeader.blockSize may not always have the exact number of items!
    var end = offset.add(goog.math.Long.fromNumber(nodeSize + treeHeader.blockSize * itemSize));
    self._get(offset, end, function(buf) {
      var node = bigwig.models.ChrTreeNode.fromDataView(new DataView(buf, 0, nodeSize), header.littleEndian);
      var items = [];
      for (var i = 0; i < node.count; ++i) {
        items.push(
          node.isLeaf ?
            bigwig.models.ChrTreeNodeLeaf.fromDataView(new DataView(buf, nodeSize + i * itemSize, itemSize), treeHeader.keySize, header.littleEndian) :
            bigwig.models.ChrTreeNodeItem.fromDataView(new DataView(buf, nodeSize + i * itemSize, itemSize), treeHeader.keySize, header.littleEndian)
        );
      }
      resolve({node: node, items: items});
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise} Promise.<bigwig.ChrTree>}
 */
bigwig.BigwigReader.prototype.readChrTree = function(header) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var root = null;
    self.readChrTreeHeader(header)
      .then(function(chrTreeHeader) {
        var treeOffset = header.chromosomeTreeOffset;
        var offset = treeOffset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.CHR_TREE_HEADER_SIZE));

        /**
         * @param {{node: bigwig.models.ChrTreeNode, items: Array.<bigwig.models.ChrTreeNodeItem|bigwig.models.ChrTreeNodeLeaf>}} data
         */
        var extractChildren = function(data) {
          var children = [];
          u.fast.forEach(data.items, function(item) {
            var child = new bigwig.ChrTree.Node({ key: item.key });
            if (data.node.isLeaf) {
              child['chrId'] = item.chrId;
              child['chrSize'] = item.chrSize;
            } else {
              self.readChrTreeNodeItems(header, chrTreeHeader, item.childOffset)
                .then(function(data) {
                  child.children = extractChildren(data);
                });
            }
            children.push(child);
          });
          return children;
        };

        self.readChrTreeNodeItems(header, chrTreeHeader, offset)
          .then(function(data) {
            var children = extractChildren(data);
            root = new bigwig.ChrTree.Node({children: children});
            resolve(new bigwig.ChrTree(root));
          });
      });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise} Promise.<number>
 */
bigwig.BigwigReader.prototype.readDataCount = function(header) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var offset = header.fullDataOffset;
    self._get(offset, offset.add(goog.math.Long.fromNumber(4)), function(buf) {
      var view = new DataView(buf);
      resolve(view.getUint32(0, header.littleEndian));
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {goog.math.Long} [offset]
 * @returns {Promise} Promise.<bigwig.models.RTreeHeader>
 */
bigwig.BigwigReader.prototype.readRTreeHeader = function(header, offset) {
  var self = this;
  return new Promise(function(resolve, reject) {
    offset = offset || header.fullIndexOffset;
    self._get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_HEADER_SIZE)), function(buf) {
      var ret = bigwig.models.RTreeHeader.fromArrayBuffer(buf, header.littleEndian);
      resolve(ret);
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {goog.math.Long} offset
 * @returns {Promise} Promise.<bigwig.models.RTreeNode>
 */
bigwig.BigwigReader.prototype.readRTreeNode = function(header, offset) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_NODE_SIZE)), function(buf) {
      var ret = bigwig.models.RTreeNode.fromArrayBuffer(buf, header.littleEndian);
      resolve(ret);
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {goog.math.Long} offset
 * @returns {Promise} Promise.<{node: bigwig.models.RTreeNode, items: Array.<bigwig.models.RTreeNodeItem|bigwig.models.RTreeNodeLeaf>}>
 */
bigwig.BigwigReader.prototype.readRTreeNodeItems = function(header, offset) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.readRTreeNode(header, offset)
      .then(function(node) {
        var itemsOffset = offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_NODE_SIZE));
        var itemSize = node.isLeaf ? bigwig.BigwigReader.R_TREE_NODE_LEAF_SIZE : bigwig.BigwigReader.R_TREE_NODE_ITEM_SIZE;
        var end = itemsOffset.add(goog.math.Long.fromNumber(node.count * itemSize));
        self._get(itemsOffset, end, function(buf) {
          var items = [];
          for (var i = 0; i < node.count; ++i) {
            items.push(
              node.isLeaf ?
                bigwig.models.RTreeNodeLeaf.fromDataView(new DataView(buf, i * itemSize, itemSize), header.littleEndian) :
                bigwig.models.RTreeNodeItem.fromDataView(new DataView(buf, i * itemSize, itemSize), header.littleEndian)
            );
          }
          resolve({node: node, items: items});
        });
      });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise} Promise.<{header: bigwig.models.RTreeHeader, nodes: Array.<bigwig.models.RTreeNode>}>
 */
/*bigwig.BigwigReader.prototype.readRTree = function(header) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var tree = {nodes:[]};
    var rTreeHeader;
    self.readRTreeHeader(header)
      .then(function(d) {
        rTreeHeader = d;
        tree.header = d;

        /!** @type {goog.math.Long} *!/
        var offset = header.fullIndexOffset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_HEADER_SIZE));
        u.async.for(rTreeHeader.itemCount, function(i) {
          self.readRTreeNode(header, offset)
            .then(function(d) {
              tree.nodes.push(d);
              offset = offset.add(goog.math.Long.fromNumber(
                bigwig.BigwigReader.R_TREE_NODE_SIZE +
                d.count * (d.isLeaf ? bigwig.BigwigReader.R_TREE_NODE_LEAF_SIZE : bigwig.BigwigReader.R_TREE_NODE_ITEM_SIZE)
              ));
            });
        }, true).then(function() {
          resolve(tree);
        });
      });
  });
};*/

/**
 * @param {bigwig.models.Header} header
 * @returns {Promise}
 */
bigwig.BigwigReader.prototype.readRTreeBranch = function(header) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var tree = {nodes:[]};

    var rTreeHeader;
    self.readRTreeHeader(header)
      .then(function(d) {
        rTreeHeader = d;
        tree.header = d;

        /** @type {goog.math.Long} */
        var offset = header.fullIndexOffset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_HEADER_SIZE));
        u.async.do(function(i) {
          return new Promise(function(itResolve, itReject) {
            self.readRTreeNodeItems(header, offset)
              .then(function(d) {
                tree.nodes.push(d);
                if (!d.node.isLeaf) {
                  offset = d.items[0].dataOffset;
                  itResolve(true);
                } else {
                  itResolve(false);
                }
              });
          });
        }).then(function() {
          resolve(tree);
        });
      });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {bigwig.models.RTreeNodeLeaf|bigwig.IndexTree.Node|{dataOffset: goog.math.Long, dataSize: goog.math.Long}} leaf
 * @returns {Promise} Promise.<{sectionHeader: bigwig.models.SectionHeader, records: Array.<bigwig.models.Record>}>
 */
bigwig.BigwigReader.prototype.readData = function(header, leaf) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var start = leaf.dataOffset;
    var end = leaf.dataOffset.add(leaf.dataSize);

    self._get(start, end, function(buf) {
      // TODO: Check whether it is compressed or not
      var compressed = new Uint8Array(buf, 0);
      var inflate = new Zlib.Inflate(compressed);
      var plain = inflate.decompress();

      var sectionHeader = bigwig.models.SectionHeader.fromDataView(new DataView(plain.buffer, 0, bigwig.BigwigReader.SECTION_HEADER_SIZE), header.littleEndian);

      var records = [];

      var recordType = bigwig.BigwigReader.RECORD_TYPES[sectionHeader.type][0];
      var fromDataView = bigwig.BigwigReader.RECORD_TYPES[sectionHeader.type][1];
      var recordSize = bigwig.models.BigwigStruct.sizeOf(recordType);
      for (var i = 0; i < sectionHeader.itemCount; ++i) {
        records[i] = fromDataView(new DataView(plain.buffer, bigwig.BigwigReader.SECTION_HEADER_SIZE + recordSize * i, recordSize), header.littleEndian);
      }

      resolve({sectionHeader: sectionHeader, records: records});
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {bigwig.models.RTreeNodeLeaf|bigwig.IndexTree.Node|{dataOffset: goog.math.Long, dataSize: goog.math.Long}} leaf
 * @returns {Promise} Promise.<{records: Array.<bigwig.models.ZoomRecord>}>}
 */
bigwig.BigwigReader.prototype.readZoomData = function(header, leaf) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var start = leaf.dataOffset;
    var end = leaf.dataOffset.add(leaf.dataSize);

    self._get(start, end, function(buf) {
      // TODO: Check whether it is compressed or not
      var compressed = new Uint8Array(buf, 0);
      var inflate = new Zlib.Inflate(compressed);
      var plain = inflate.decompress();

      var recordSize = bigwig.BigwigReader.ZOOM_RECORD_SIZE;
      var nRecords = plain.byteLength / recordSize;
      var records = new Array(nRecords);

      for (var i = 0; i < nRecords; ++i) {
        records[i] = bigwig.models.ZoomRecord.fromDataView(new DataView(plain.buffer, i * recordSize, recordSize), header.littleEndian);
      }

      resolve({records: records});
    });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {{chr: number, start: number, end: number}|undefined} range
 * @param {goog.math.Long} offset
 * @returns {Promise} Promise.<Array.<bigwig.IndexTree.Node>>
 */
bigwig.BigwigReader.prototype.readIndexBlock = function(header, range, offset) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.readRTreeNodeItems(header, offset)
      .then(
      /**
       * @param {{node: bigwig.models.RTreeNode, items: Array.<bigwig.models.RTreeNodeItem|bigwig.models.RTreeNodeLeaf>}} d
       */
      function(d) {
        if (d.node.isLeaf) {
          var leaves = [];
          u.fast.forEach(d.items, function(it) {
            var node = new bigwig.IndexTree.Node({
              isLeaf: true,
              startChrId: it.startChromIx,
              startBase: it.startBase,
              endChrId: it.endChromIx,
              endBase: it.endBase,
              dataOffset: it.dataOffset,
              dataSize: it.dataSize
            });
            leaves.push(node);
          });
          resolve(leaves);
          return;
        }

        var nodes = [];
        var remaining = d.items.length;

        u.async.each(d.items, function(it, i) {
          return new Promise(function(itResolve, itReject) {
            var node = new bigwig.IndexTree.Node({
              isLeaf: false,
              startChrId: it.startChromIx,
              startBase: it.startBase,
              endChrId: it.endChromIx,
              endBase: it.endBase,
              dataOffset: it.dataOffset
            });
            nodes.push(node);

            if (range && it.startChromIx > range['chr'] && it.endChromIx < range['chr']) {
              itResolve();
              return;
            }
            if (range && ((it.endChromIx == range['chr'] && it.endBase <= range['start']) || (it.startChromIx == range['chr'] && it.startBase >= range['end']))) {
              itResolve();
              return;
            }

            self.readIndexBlock(header, range, it.dataOffset)
              .then(function(children) {
                node.children = children;
                itResolve();
              });
          });
        }).then(function() {
          resolve(nodes);
        });
      });
  });
};

/**
 * @param {bigwig.models.Header} header
 * @param {{chr: number, start: number, end: number}} [range]
 * @param {goog.math.Long} [offset]
 * @returns {Promise} Promise.<bigwig.IndexTree>
 */
bigwig.BigwigReader.prototype.readRootedIndexBlock = function(header, range, offset) {
  var self = this;

  return new Promise(function(resolve, reject) {
    offset = offset || header.fullIndexOffset;
    self.readRTreeHeader(header, offset)
      .then(function(d) {
        /** @type {goog.math.Long} */
        var rootOffset = offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_HEADER_SIZE));
        var root = new bigwig.IndexTree.Node({
          isLeaf: false,
          startChrId: d.startChromIx,
          endChrId: d.endChromIx,
          startBase: d.startBase,
          endBase: d.endBase,
          dataOffset: rootOffset
        });

        self.readIndexBlock(header, range, rootOffset)
          .then(function(children) {
            root.children = children;
            resolve(new bigwig.IndexTree(root));
          });
      });
  });
};


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

  'end': { get: /** @type {function (this:bigwig.DataRecordZoom)} */ (function() { return this._record.end; })}
});

/**
 * @param {bigwig.DataRecord.Aggregate} [aggregate]
 * @override
 */
bigwig.DataRecordZoom.prototype.value = function(aggregate) {
  var Aggregate = bigwig.DataRecord.Aggregate;
  switch (aggregate) {
    case Aggregate['MIN']:
      return this._record.minVal;
    case Aggregate['MAX']:
      return this._record.maxVal;
    case Aggregate['SUM']:
      return this._record.sumData;
    case Aggregate['SUMSQ']:
      return this._record.sumSquares;
    case Aggregate['NORM']:
      return Math.sqrt(this._record.sumSquares / this._record.validCount);
    case Aggregate['CNT']:
      return this._record.validCount;
    case Aggregate['AVG']:
    default:
      return this._record.sumData / this._record.validCount;
  }
};


goog.provide('bigwig.BigwigFile');

goog.require('bigwig.BigwigReader');
goog.require('bigwig.models.Header');
goog.require('bigwig.models.Record');

goog.require('bigwig.ChrTree');
goog.require('bigwig.IndexTree');
goog.require('bigwig.DataRecordImpl');
goog.require('bigwig.DataRecordZoom');

/**
 * @param {string} uri
 * @param {string} [fwdUri]
 * @param {number} [cacheBlockSize] Default is 512KB
 * @constructor
 */
bigwig.BigwigFile = function(uri, fwdUri, cacheBlockSize) {
  /**
   * @type {bigwig.BigwigReader}
   * @private
   */
  this._reader = new bigwig.BigwigReader(uri, fwdUri, cacheBlockSize);

  /**
   * @type {bigwig.models.Header}
   * @private
   */
  this._header = null;

  /**
   * @type {bigwig.models.TotalSummary}
   * @private
   */
  this._summary = null;

  /**
   * @type {bigwig.ChrTree}
   * @private
   */
  this._chrTree = null;

  /**
   * @type {bigwig.IndexTree}
   * @private
   */
  this._indexTree = null;

  /**
   * @type {Array.<bigwig.models.ZoomHeader>}
   * @private
   */
  this._zoomHeaders = null;

  /**
   * @type {Array.<bigwig.IndexTree>}
   * @private
   */
  this._zoomTrees = null;

  /**
   * @type {boolean}
   * @private
   */
  this._initializationStarted = false;

  /**
   * @type {Function}
   * @private
   */
  this._initializedResolve = null;

  /**
   * @type {Function}
   * @private
   */
  this._initializedReject = null;

  /**
   * @type {boolean}
   * @private
   */
  this._initializedFired = false;

  var self = this;
  /**
   * @type {Promise} Promise.<bigwig.BigwigFile>
   * @private
   */
  this._initialized = new Promise(function(resolve, reject) { self._initializedResolve = resolve; self._initializedReject = reject; });
};

/**
 * @param {{chr: (string|number), start: number, end: number}} [range]
 * @param {{level: (number|undefined), maxItems: (number|undefined), maxBases: (number|undefined)}} [zoom]
 * @returns {Promise} Promise.<Array.<bigwig.DataRecord>>}
 */
bigwig.BigwigFile.prototype.query = function(range, zoom) {
  var self = this;
  var resolve, reject;
  var promise = new Promise(function() { resolve = arguments[0]; reject = arguments[1]; });

  if (!this._initializedFired) {
    this['initialized'].then(function() {
      self.query(range, zoom).then(resolve);
    });
    return promise;
  }

  /**
   * @type {number}
   */
  var chrId;

  if (range) {
    chrId = /** @type {number} */ (this._chrTree.getLeaf(range['chr'])['chrId']);
    range = {'chr': chrId, 'start': range['start'], 'end': range['end']};
  }

  // Adaptive zoom
  if (zoom && zoom['level'] == undefined &&
    ((zoom['maxItems'] && zoom['maxItems'] > 0) || (zoom['maxBases'] && zoom['maxBases'] > 0))) {
    if (!zoom['maxBases']) { zoom['maxBases'] = zoom['maxItems']; }
    if (!zoom['maxItems']) { zoom['maxItems'] = zoom['maxBases']; }
    var basesPerItem = u.fast.map(this._zoomHeaders, function(z) { return z.reductionLevel; });
    var i = -1;

    // If there is no specified range, then we look at the entire genome
    var rangeWidth = range ? range['end'] - range['start'] :
      u.fast.map(this._chrTree.leaves, function(leaf) { return leaf['chrSize']; })
        .reduce(function(s1, s2) { return s1 + s2; });
    if (rangeWidth > zoom['maxBases']) { ++i; }
    if (i == 0) {
      for (; i < this._zoomHeaders.length - 1; ++i) {
        if ((rangeWidth) / basesPerItem[i] <= zoom['maxItems']) { break; }
      }
    }

    zoom['level'] = i;
  }
  var useZoom = zoom && (zoom['level'] >= 0);

  var indexTree = useZoom ? this._zoomTrees[zoom['level']]: this._indexTree;
  if (!indexTree) {
    var treeOffset = useZoom ? this._zoomHeaders[zoom['level']].indexOffset : this._header.fullIndexOffset;
    this._reader.readRootedIndexBlock(this._header, range, treeOffset)
      .then(function(tree) {
        if (useZoom) { self._zoomTrees[zoom['level']] = tree; }
        else { self._indexTree = tree; }
        self.query(range, zoom).then(resolve);
      });
    return promise;
  }

  /**
   * @type {Array.<bigwig.IndexTree.Node>}
   */
  var nodes = indexTree.query(range);
  var remaining = 0;
  u.fast.forEach(nodes, function(node) {
    if (!node.isLeaf) {
      ++remaining;
      self._reader.readIndexBlock(self._header, /** @type {{chr: number, start: number, end: number}} */ (range), /** @type {goog.math.Long} */ (node.dataOffset))
        .then(function(children) {
          node.children = children;
          --remaining;
          if (!remaining) {
            self.query(range, zoom).then(resolve);
          }
        });
    }
  });

  if (remaining) { return promise; }

  remaining = 0;
  u.fast.forEach(nodes,
    /**
     * @param {bigwig.IndexTree.Node} node
     */
    function(node) {
    if (!node.dataRecords) {
      ++remaining;

      if (useZoom) {
        self._reader.readZoomData(self._header, node)
          .then(
          /**
           * @param {{records: Array.<bigwig.models.ZoomRecord>}} d
           */
          function (d) {
            node.dataRecords = u.fast.map(d.records, function(r) { return new bigwig.DataRecordZoom(node, /** @type {bigwig.models.ZoomRecord} */ (r), self._chrTree); });

            --remaining;
            if (!remaining) {
              self.query(range, zoom).then(resolve);
            }
          });
      } else {
        self._reader.readData(self._header, node)
          .then(
          /**
           * @param {{sectionHeader: bigwig.models.SectionHeader, records: Array.<bigwig.models.Record>}} d
           */
          function (d) {
            node.dataRecords = u.fast.map(d.records, function(r, i) {
              return new bigwig.DataRecordImpl(node, d.sectionHeader, r, i, self._chrTree);
            });

            --remaining;
            if (!remaining) {
              self.query(range, zoom).then(resolve);
            }
          });
      }
    }
  });

  if (remaining) { return promise; }

  var ret = u.fast.concat(u.fast.map(nodes,
    function(node) {
      return !range ? node.dataRecords :
        u.fast.filter(node.dataRecords, /** @param {bigwig.DataRecord} r */ function(r) { return r['chr'] == range['chr'] && r['start'] < range['end'] && r['end'] > range['start']; })}));

  resolve(ret);

  return promise;
};

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

Object.defineProperties(bigwig.BigwigFile.prototype, {
  'initialized': { get: /** @type {function (this:bigwig.BigwigFile)} */ (function() {
    if (this._initializationStarted) {
      return this._initialized;
    }

    this._initializationStarted = true;
    this._initialize();
    return this._initialized;
  })},

  'summary': { get: /** @type {function (this:bigwig.BigwigFile)} */ (function() {
    return this._summary ? {
      'basesCovered': this._summary.basesCovered.toString(),
      'min': this._summary.minVal,
      'max': this._summary.maxVal,
      'sumData': this._summary.sumData,
      'sumSquares': this._summary.sumSquares
    } : null;
  })},

  'chromosomes': { get: /** @type {function (this:bigwig.BigwigFile)} */ (function() {
    return this._chrTree ? this._chrTree.leaves : null;
  })},

  'zoomLevels': { get: /** @type {function (this:bigwig.BigwigFile)} */ (function() {
    return this._header ? this._header.zoomLevels : null;
  })}
});

/**
 * @returns {Promise} Promise.<bigwig.BigwigFile>
 * @private
 */
bigwig.BigwigFile.prototype._initialize = function() {
  var self = this;
  var resolve, reject;
  var promise = new Promise(function() { resolve = arguments[0]; reject = arguments[1]; });

  if (!this._header) {
    this._reader.readHeader()
      .then(function(header) {
        self._header = header;
        self._initialize().then(resolve);
      });
    return promise;
  }

  if (!this._summary) {
    this._reader.readTotalSummary(this._header)
      .then(function(totalSummary) {
        self._summary = totalSummary;
        self._initialize().then(resolve);
      });
    return promise;
  }

  if (!this._chrTree) {
    this._reader.readChrTree(this._header)
      .then(function(chrTree) {
        self._chrTree = chrTree;
        self._initialize().then(resolve);
      });
    return promise;
  }

  if (!this._zoomHeaders) {
    this._reader.readZoomHeaders(this._header)
      .then(function(zoomHeaders) {
        self._zoomHeaders = zoomHeaders;
        self._initialize().then(resolve);
      });
    return promise;
  }

  if (!this._zoomTrees) {
    this._zoomTrees = new Array(this._header.zoomLevels);
  }

  this._initializedFired = true;
  this._initializedResolve(this);
  return this._initialized;
};


goog.provide('bigwig');

goog.require('bigwig.BigwigFile');
