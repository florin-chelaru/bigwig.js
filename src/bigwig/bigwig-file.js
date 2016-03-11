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
    var basesPerItem = this._zoomHeaders.map(function(z) { return z.reductionLevel; });
    var i = -1;

    // If there is no specified range, then we look at the entire genome
    var rangeWidth = range ? range['end'] - range['start'] :
      this._chrTree.leaves.map(/** @param {bigwig.ChrTree.Node} leaf */ function(leaf) { return leaf['chrSize']; })
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
  nodes.forEach(function(node) {
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
            node.dataRecords = d.records.map(function(r, i) {
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

  var ret = nodes
    .map(function(node) {
      return !range ? node.dataRecords :
        node.dataRecords.filter(/** @param {bigwig.DataRecord} r */ function(r) { return r['chr'] == range['chr'] && r['start'] < range['end'] && r['end'] > range['start']; })})
    .reduce(function(a1, a2) { return a1.concat(a2); });

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
