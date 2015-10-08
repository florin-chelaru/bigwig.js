/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 2:51 PM
 */

if (window['BW_DEBUG']) {
  goog.require('goog.math.Long');
  goog.require('goog.async.Deferred');
  goog.require('goog.string.format');
  goog.require('bigwig.BigwigFile');
}

var main = angular.module('main', []);

main.controller('Query', ['$scope', function($scope) {
  $scope.file = 'http://egg2.wustl.edu/roadmap/data/byFileType/signal/consolidated/macs2signal/pval/E001-H3K4me1.pval.signal.bigwig';
  $scope.query = 'chr=chr1&start=0&end=100000';
  $scope.message = 'Result will be shown here.';
  $scope.results = [];
  $scope.success = false;

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
      this.bigwig = new bigwig.BigwigFile(this.file, 'http://epiviz-dev.cbcb.umd.edu/bigwig/partial.php');
      //this.bigwig = new bigwig.BigwigFile(this.file, 'http://localhost/bigwig/test/partial.php');
    }

    var self = this;
    this.bigwig.query(args.chr, parseInt(args.start), parseInt(args.end))
      .then(function(d) {
        self.message = 'Success!';
        self.success = true;
        self.results = d;
        if (!self.$$phase) {
          self.$apply();
        }
      });
  }
}]);
