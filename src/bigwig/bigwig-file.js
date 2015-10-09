/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/29/2015
 * Time: 12:56 PM
 */

goog.provide('bigwig.BigwigFile');

goog.require('bigwig.BigwigReader');
goog.require('bigwig.models.Header');
goog.require('bigwig.models.Record');

goog.require('bigwig.ChrTree');
goog.require('bigwig.IndexTree');
goog.require('bigwig.DataRecord');

goog.require('goog.async.Deferred');

/**
 * @param {string} uri
 * @param {string} [fwdUri]
 * @constructor
 */
bigwig.BigwigFile = function(uri, fwdUri) {
  /**
   * @type {bigwig.BigwigReader}
   * @private
   */
  this._reader = new bigwig.BigwigReader(uri, fwdUri);

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
   * @type {boolean}
   * @private
   */
  this._initializationStarted = false;

  /**
   * @type {goog.async.Deferred.<bigwig.BigwigFile>}
   * @private
   */
  this._initialized = new goog.async.Deferred();
};

/**
 * @param {string|number} chr
 * @param {number} start
 * @param {number} end
 * @returns {goog.async.Deferred.<bigwig.DataRecord>}
 */
bigwig.BigwigFile.prototype.query = function(chr, start, end) {
  var self = this;
  var deferred = new goog.async.Deferred();

  if (!this['initialized'].hasFired()) {
    this['initialized'].then(function() {
      self.query(chr, start, end).chainDeferred(deferred);
    });
    return deferred;
  }

  /**
   * @type {bigwig.ChrTree.Node}
   */
  var chrNode = this._chrTree.getLeaf(chr);
  var chrId = /** @type {number} */ (chrNode['chrId']);

  if (!this._indexTree) {
    this._reader.readRootedIndexBlock(this._header, chrId, start, end)
      .then(function(tree) {
        self._indexTree = tree;
        self.query(chrId, start, end).chainDeferred(deferred);
      });
    return deferred;
  }

  /**
   * @type {Array.<bigwig.IndexTree.Node>}
   */
  var nodes = this._indexTree.query(chrId, start, end);
  var remaining = 0;
  nodes.forEach(function(node) {
    if (!node.isLeaf) {
      ++remaining;
      self._reader.readIndexBlock(self._header, chrId, start, end, /** @type {goog.math.Long} */ (node.dataOffset))
        .then(function(children) {
          node.children = children;
          --remaining;
          if (!remaining) {
            self.query(chrId, start, end).chainDeferred(deferred);
          }
        });
    }
  });

  if (remaining) { return deferred; }

  remaining = 0;
  nodes.forEach(function(node) {
    if (!node.dataRecords) {
      ++remaining;
      self._reader.readData(self._header, node)
        .then(
        /**
         * @param {{sectionHeader: bigwig.models.SectionHeader, records: Array.<bigwig.models.Record>}} d
         */
        function(d) {
          node.dataRecords = d.records.map(function(r, i) {
            return new bigwig.DataRecord(node, d.sectionHeader, r, i, self._chrTree);
          });

          --remaining;
          if (!remaining) {
            self.query(chrId, start, end).chainDeferred(deferred);
          }
        }
      )
    }
  });

  if (remaining) { return deferred; }

  var ret = nodes
    .map(function(node) { return node.dataRecords.filter(/** @param {bigwig.DataRecord} r */ function(r) { return r['chr'] == chrId && r['start'] < end && r['end'] > start; })})
    .reduce(function(a1, a2) { return a1.concat(a2); });

  deferred.callback(ret);

  return deferred;
};

/**
 * @type {goog.async.Deferred}
 * @name {bigwig.BigwigFile#initialized}
 */
bigwig.BigwigFile.prototype.initialized;

/**
 * @type {{basesCovered: string, min: number, max: number, sumData: number, sumSquares: number}}
 * @name {bigwig.BigwigFile#summary}
 */
bigwig.BigwigFile.prototype.summary;

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
  })}
});

/**
 * @returns {goog.async.Deferred.<bigwig.BigwigFile>}
 * @private
 */
bigwig.BigwigFile.prototype._initialize = function() {
  var self = this;
  var deferred = new goog.async.Deferred();

  if (!this._header) {
    this._reader.readHeader()
      .then(function(header) {
        self._header = header;
        self._initialize().chainDeferred(deferred);
      });
    return deferred;
  }

  if (!this._summary) {
    this._reader.readTotalSummary(this._header)
      .then(function(totalSummary) {
        self._summary = totalSummary;
        self._initialize().chainDeferred(deferred);
      });
    return deferred;
  }

  if (!this._chrTree) {
    this._reader.readChrTree(this._header)
      .then(function(chrTree) {
        self._chrTree = chrTree;
        self._initialize().chainDeferred(deferred);
      });
    return deferred;
  }

  this._initialized.callback(this);
  return this._initialized;
};
