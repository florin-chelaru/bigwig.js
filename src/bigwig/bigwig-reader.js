/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 11:24 AM
 */

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
 * @constructor
 */
bigwig.BigwigReader = function(uri, fwdUri) {
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
};

bigwig.BigwigReader.N_RETRIES = 10;

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
 * @param {function(*)} callback
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
    req.onload = callback;
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

/**
 * @returns {Promise} Promise.<bigwig.models.Header>
 */
bigwig.BigwigReader.prototype.readHeader = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.get(0, bigwig.BigwigReader.HEADER_SIZE, function(e) {
      var buf = e.target.response;
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
    self.get(offset + index * zoomHeaderSize, offset + (index + 1) * zoomHeaderSize, function(e) {
      var buf = e.target.response;
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
    self.get(offset, offset + bigwig.BigwigReader.TOTAL_SUMMARY_SIZE, function(e) {
      var buf = e.target.response;
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
    self.get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.CHR_TREE_HEADER_SIZE)), function(e) {
      var buf = e.target.response;
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
    self.get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.CHR_TREE_NODE_SIZE)), function (e) {
      var buf = e.target.response;
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
    self.get(offset, end, function(e) {
      var buf = e.target.response;
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
          data.items.forEach(function(item) {
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
    self.get(offset, offset.add(goog.math.Long.fromNumber(4)), function(e) {
      var buf = e.target.response;
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
    self.get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_HEADER_SIZE)), function(e) {
      var buf = e.target.response;
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
    self.get(offset, offset.add(goog.math.Long.fromNumber(bigwig.BigwigReader.R_TREE_NODE_SIZE)), function(e) {
      var buf = e.target.response;
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
        self.get(itemsOffset, end, function(e) {
          var buf = e.target.response;
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

    self.get(start, end, function(e) {
      var buf = e.target.response;
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

    self.get(start, end, function(e) {
      var buf = e.target.response;
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
 * @param {number} chr
 * @param {number} start
 * @param {number} end
 * @param {goog.math.Long} offset
 * @returns {Promise} Promise.<Array.<bigwig.IndexTree.Node>>
 */
bigwig.BigwigReader.prototype.readIndexBlock = function(header, chr, start, end, offset) {
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
          d.items.forEach(function(it) {
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

            if (it.startChromIx > chr && it.endChromIx < chr) {
              itResolve();
              return;
            }
            if (it.endChromIx == chr && it.endBase <= start || it.startChromIx == chr && it.startBase >= end) {
              itResolve();
              return;
            }

            self.readIndexBlock(header, chr, start, end, it.dataOffset)
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
 * @param {number} chr
 * @param {number} start
 * @param {number} end
 * @param {goog.math.Long} [offset]
 * @returns {Promise} Promise.<bigwig.IndexTree>
 */
bigwig.BigwigReader.prototype.readRootedIndexBlock = function(header, chr, start, end, offset) {
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

        self.readIndexBlock(header, chr, start, end, rootOffset)
          .then(function(children) {
            root.children = children;
            resolve(new bigwig.IndexTree(root));
          });
      });
  });
};
