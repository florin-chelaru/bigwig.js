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
goog.require('bigwig.DataRecordImpl');
goog.require('bigwig.DataRecordZoom');


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
   * @type {goog.async.Deferred.<bigwig.BigwigFile>}
   * @private
   */
  this._initialized = new goog.async.Deferred();
};

/**
 * @param {string|number} chr
 * @param {number} start
 * @param {number} end
 * @param {{level: (number|undefined), maxItems: (number|undefined), maxBases: (number|undefined)}} [zoom]
 * @returns {goog.async.Deferred.<bigwig.DataRecord>}
 */
bigwig.BigwigFile.prototype.query = function(chr, start, end, zoom) {
  var self = this;
  var deferred = new goog.async.Deferred();

  if (!this['initialized'].hasFired()) {
    this['initialized'].then(function() {
      self.query(chr, start, end, zoom).chainDeferred(deferred);
    });
    return deferred;
  }

  /**
   * @type {bigwig.ChrTree.Node}
   */
  var chrNode = this._chrTree.getLeaf(chr);
  var chrId = /** @type {number} */ (chrNode['chrId']);

  // Adaptive zoom
  if (zoom && zoom.level == undefined &&
    ((zoom.maxItems && zoom.maxItems > 0) || (zoom.maxBases && zoom.maxBases > 0))) {
    if (!zoom.maxBases) { zoom.maxBases = zoom.maxItems; }
    if (!zoom.maxItems) { zoom.maxItems = zoom.maxBases; }
    var basesPerItem = this._zoomHeaders.map(function(z) { return z.reductionLevel; });
    var i = -1;
    if (end - start > zoom.maxBases) { ++i; }
    if (i == 0) {
      for (; i < this._zoomHeaders.length - 1; ++i) {
        if ((end - start) / basesPerItem[i] <= zoom.maxItems) { break; }
      }
    }

    zoom.level = i;
  }
  var useZoom = zoom && (zoom.level >= 0);

  var indexTree = useZoom ? this._zoomTrees[zoom.level]: this._indexTree;
  if (!indexTree) {
    var treeOffset = useZoom ? this._zoomHeaders[zoom.level].indexOffset : this._header.fullIndexOffset;
    this._reader.readRootedIndexBlock(this._header, chrId, start, end, treeOffset)
      .then(function(tree) {
        if (useZoom) { self._zoomTrees[zoom.level] = tree; }
        else { self._indexTree = tree; }
        self.query(chrId, start, end, zoom).chainDeferred(deferred);
      });
    return deferred;
  }

  /**
   * @type {Array.<bigwig.IndexTree.Node>}
   */
  var nodes = indexTree.query(chrId, start, end);
  var remaining = 0;
  nodes.forEach(function(node) {
    if (!node.isLeaf) {
      ++remaining;
      self._reader.readIndexBlock(self._header, chrId, start, end, /** @type {goog.math.Long} */ (node.dataOffset))
        .then(function(children) {
          node.children = children;
          --remaining;
          if (!remaining) {
            self.query(chrId, start, end, zoom).chainDeferred(deferred);
          }
        });
    }
  });

  if (remaining) { return deferred; }

  remaining = 0;
  nodes.forEach(function(node) {
    if (!node.dataRecords) {
      ++remaining;

      if (useZoom) {
        self._reader.readZoomData(self._header, node)
          .then(
          /**
           * @param {{records: Array.<bigwig.models.ZoomRecord>}} d
           */
          function (d) {
            node.dataRecords = d.records.map(function(r) { return new bigwig.DataRecordZoom(node, r, self._chrTree); });

            --remaining;
            if (!remaining) {
              self.query(chrId, start, end, zoom).chainDeferred(deferred);
            }
          });
      } else {
        self._reader.readData(self._header, node)
          .then(
          /**
           * @param {{sectionHeader: bigwig.models.SectionHeader, records: Array.<bigwig.models.Record>}} d
           */
          function (d) {
            node.dataRecords = d.records.map(function(r, i) {
              return new bigwig.DataRecordImpl(node, d.sectionHeader, r, i, self._chrTree);
            });

            --remaining;
            if (!remaining) {
              self.query(chrId, start, end, zoom).chainDeferred(deferred);
            }
          });
      }
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

/**
 * @type {number}
 * @name {bigwig.BigwigFile#zoomLevels}
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

  if (!this._zoomHeaders) {
    this._reader.readZoomHeaders(this._header)
      .then(function(zoomHeaders) {
        self._zoomHeaders = zoomHeaders;
        self._initialize().chainDeferred(deferred);
      });
    return deferred;
  }

  if (!this._zoomTrees) {
    this._zoomTrees = new Array(this._header.zoomLevels);
  }

  this._initialized.callback(this);
  return this._initialized;
};
