/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 2:51 PM
 */

if (window['BW_DEBUG']) {
  goog.require('goog.string.format');
  goog.require('bigwig.BigwigFile');
}

var main = angular.module('main', []);

main.controller('Query', ['$scope', function($scope) {
  $scope.file = /*'http://localhost/E120-H3K9ac.pval.signal.bigwig';*/'http://egg2.wustl.edu/roadmap/data/byFileType/signal/consolidated/macs2signal/pval/E001-H3K4me1.pval.signal.bigwig';
  $scope.query = 'chr=chr1&start=0&end=100000';
  $scope.message = 'Result will be shown here.';
  $scope.results = [];
  $scope.success = false;
  $scope.initialized = false;
  $scope.chromosomes = [];
  $scope.zoomLevel = 'none';
  $scope.zoomLevels = [];
  $scope.time = 0;
  $scope.cacheBlockSize = 0;

  $scope.bigwig = null;

  var extractArgs = function(argsStr) {
    var argPairs = argsStr.split('&');

    var args = {};
    argPairs.forEach(function(pair, i) {
      if (pair.trim().length == 0) { return; }
      var arrInd = pair.indexOf('[]');
      if (arrInd == 0) { return; }

      var arg, val;
      var eqInd = pair.indexOf('=');
      if (eqInd < 0) {
        arg = (arrInd < 0) ? pair : pair.substr(0, arrInd);
        val = 'true';
      } else {
        arg = (arrInd < 0) ? pair.substr(0, eqInd) : pair.substr(0, arrInd);
        val = pair.substr(eqInd + 1);
      }

      arg = decodeURIComponent(arg);
      val = decodeURIComponent(val);

      if (arrInd < 0) { args[arg] = val; }
      else {
        if (!(arg in args)) { args[arg] = []; }
        args[arg].push(val);
      }
    });

    return args;
  };

  $scope.sendQuery = function() {
    this.success = false;
    this.message = 'Retrieving data...';
    var args = extractArgs(this.query);
    if (!this.file || !args.chr || !args.start || !args.end) {
      this.message = 'Please specify valid file, chr, start and end';
      return;
    }

    if (!this.bigwig) {
      //this.bigwig = new bigwig.BigwigFile(this.file, 'http://epiviz-dev.cbcb.umd.edu/bigwig/partial.php', parseInt(this.cacheBlockSize));
      this.bigwig = new bigwig.BigwigFile(this.file, 'partial.php', parseInt(this.cacheBlockSize));
      //this.bigwig = new bigwig.BigwigFile(this.file, 'http://localhost/bigwig/test/partial.php', true);
      //this.bigwig = new bigwig.BigwigFile(this.file);
    }

    var startTime = new Date();
    var self = this;
    var init = this.bigwig.initialized;
    init
      .then(function(file) {
        $scope.initialized = true;
        self.minVal = file.summary.min;
        self.maxVal = file.summary.max;
        self.chromosomes = file.chromosomes;
        self.message = 'Initialized! Getting data...';
        self.zoomLevels = u.array.range(file.zoomLevels);
        if (!self.$$phase) {
          self.$apply();
        }

        var zoomLevel = self.zoomLevel == 'none' ? undefined : parseInt(self.zoomLevel);
        //var ret = file.query(args.chr, parseInt(args.start), parseInt(args.end), {maxBases: 10000, maxItems: 1000, level: zoomLevel});
        //var ret = file.query(args.chr, parseInt(args.start), parseInt(args.end), {level: zoomLevel});
        //var ret = file.query(args.chr, parseInt(args.start), parseInt(args.end), {level:zoomLevel});
        var ret = file.query(undefined, {maxItems: 50000});
        return ret;
      })
      .then(/** @param {Array.<bigwig.DataRecord>} d */ function(d) {
        d.sort(
          /**
           * @param {bigwig.DataRecord} r1
           * @param {bigwig.DataRecord} r2
           */
          function(r1, r2) {
            if (r1.chr != r2.chr) {
              var id1 = r1.chrName.substr(3);
              var id2 = r2.chrName.substr(3);
              var n1 = parseInt(id1);
              var n2 = parseInt(id2);
              if (isNaN(n1) || isNaN(n2)) {
                return id1 < id2 ? -1 : 1;
              }
              return n1 - n2;
            }
            return r1.start - r2.start;
          });
        self.time = new Date() - startTime;
        self.message = 'Success!';
        self.success = true;
        self.results = d;
        if (!self.$$phase) {
          self.$apply();
        }
      });
  }
}]);

/*$(function() {
  var b = new bigwig.BigwigReader('http://localhost/E120-H3K9ac.pval.signal.bigwig', 'http://localhost/bigwig/test/partial.php');
  for (var i = 0; i < 5; ++i) {
    b.getCached(0, 16, function (buf) {
      var bytes = new Uint8Array(buf);
      console.log(bytes);
    });
  }
  for (var i = 0; i < 5; ++i) {
    b.getCached(16, 32, function (buf) {
      var bytes = new Uint8Array(buf);
      console.log(bytes);
    });
  }
});*/
