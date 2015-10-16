/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 10/16/2015
 * Time: 4:37 PM
 */

//var URI = window.location.href + 'data/wigVarStepExample.bigwig';
var URI = window.location.href + 'data/E120-H3K9ac.pval.signal.bigwig';
var FWD_URI = window.location.href + 'partial.php';

QUnit.test('bigwig.BigwigReader', function(assert) {
  assert.ok(bigwig.BigwigReader);
});

QUnit.test('bigwig.BigwigReader.prototype.get', function(assert) {
  var done = assert.async();
  assert.ok(bigwig.BigwigReader.prototype.get);

  var finished = false;

  var exp = [0x70, 0xd3, 0x1f, 0x01, 0x00, 0x00, 0x00, 0x00];

  var r1 = new bigwig.BigwigReader(URI);
  r1.get(80, 88, function(e) {
    if (!finished) {
      var buf = e.target.response;
      var act = Array.prototype.slice.call(new Uint8Array(buf));
      assert.deepEqual(act, exp);
      finished = true;
      done();
    }
  });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigReader.prototype.get [proxy]', function(assert) {
  var done = assert.async();

  var finished = false;

  var exp = [0x70, 0xd3, 0x1f, 0x01, 0x00, 0x00, 0x00, 0x00];

  var r1 = new bigwig.BigwigReader(URI, FWD_URI);
  r1.get(80, 88, function(e) {
    if (!finished) {
      var buf = e.target.response;
      var act = Array.prototype.slice.call(new Uint8Array(buf));
      assert.deepEqual(act, exp);
      finished = true;
      done();
    }
  });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigReader.prototype.readHeader', function(assert) {
  var done = assert.async();

  assert.ok(bigwig.BigwigReader.prototype.readHeader);

  var finished = false;

  var r = new bigwig.BigwigReader(URI);
  r.readHeader()
    .then(function(header) {
      if (!finished) {
        assert.ok(header);
        assert.ok(header instanceof bigwig.models.Header);
        assert.equal(header.toString(), '{"magic":654086024,"version":4,"zoomLevels":10,"chromosomeTreeOffset":344,"fullDataOffset":393,"fullIndexOffset":15751049,"fieldCount":0,"definedFieldCount":0,"autoSqlOffset":0,"totalSummaryOffset":304,"uncompressedBufSize":32768,"reserved":0}');
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigReader.prototype.readZoomHeaders', function(assert) {
  var done = assert.async();

  assert.ok(bigwig.BigwigReader.prototype.readZoomHeaders);

  var finished = false;

  var r = new bigwig.BigwigReader(URI);
  r.readHeader()
    .then(function(header) {
      return r.readZoomHeaders(header);
    })
    .then(function(d) {
      if (!finished) {
        assert.ok(d);
        assert.ok(d instanceof Array);
        assert.equal(d.length, 10);
        d.forEach(function(it) { assert.ok(it instanceof bigwig.models.ZoomHeader); });
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigReader.prototype.readTotalSummary', function(assert) {
  var done = assert.async();

  assert.ok(bigwig.BigwigReader.prototype.readTotalSummary);

  var finished = false;

  var r = new bigwig.BigwigReader(URI);
  r.readHeader()
    .then(function(header) {
      return r.readTotalSummary(header);
    })
    .then(function(d) {
      if (!finished) {
        assert.ok(d);
        assert.ok(d instanceof bigwig.models.TotalSummary);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigReader.prototype.readChrTreeHeader', function(assert) {
  var done = assert.async();

  assert.ok(bigwig.BigwigReader.prototype.readChrTreeHeader);

  var finished = false;

  var r = new bigwig.BigwigReader(URI);
  r.readHeader()
    .then(function(header) {
      return r.readChrTreeHeader(header);
    })
    .then(function(d) {
      if (!finished) {
        assert.ok(d);
        assert.ok(d instanceof bigwig.models.ChrTreeHeader);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigReader.prototype.readChrTree', function(assert) {
  var done = assert.async();

  assert.ok(bigwig.BigwigReader.prototype.readChrTree);

  var finished = false;

  var r = new bigwig.BigwigReader(URI);
  r.readHeader()
    .then(function(header) {
      return r.readChrTree(header);
    })
    .then(function(d) {
      if (!finished) {
        assert.ok(d);
        assert.ok(d instanceof bigwig.ChrTree);
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 500);
});

QUnit.test('bigwig.BigwigFile.prototype.query', function(assert) {
  var done = assert.async();

  assert.ok(bigwig.BigwigFile);
  assert.ok(bigwig.BigwigFile.prototype.query);

  var finished = false;

  var f = new bigwig.BigwigFile(URI);
  f.query('chr1', 0, 100000)
    .then(function(d) {
      if (!finished) {
        assert.ok(d);
        /*assert.ok(d instanceof Object);
        assert.ok(d.header);
        assert.ok(d.header instanceof bigwig.models.RTreeHeader);
        assert.ok(d.nodes);
        assert.ok(d.nodes instanceof Array);
        assert.equal(d.nodes.length, 0);
        d.nodes.forEach(function(node) {
          assert.ok(node instanceof bigwig.models.RTreeNode);
        });*/
        finished = true;
        done();
      }
    });

  setTimeout(function() {
    assert.ok(finished, 'Timed out');
    if (!finished) { done(); finished = true; }
  }, 5000);
});

