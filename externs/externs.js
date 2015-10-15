// Generated with http://www.dotnetwise.com/Code/Externs/:
var u = {
  "array": {
    "fromArguments": function () {}
  },
  /**
   * @constructor
   */
  "Exception": function (message, innerException) {},
  "reflection": {
    "ReflectionException": function () {},
    "evaluateFullyQualifiedTypeName": function () {},
    "applyConstructor": function () {}
  },
  "each": function () {},
  "map": function() {},
  "async": {
    /**
     * @constructor
     */
    "Deferred": function() {},
    "all": function() {},
    "for": function() {},
    "each": function() {}
  }
};

/**
 * @param {...} args
 */
u.async.Deferred.prototype.then = function(args) {};

/**
 * @param {...} args
 */
u.async.Deferred.prototype.callback = function(args) {};

/**
 * @param {...} args
 */
u.async.Deferred.prototype.chainDeferred = function(args) {};

/**
 * @param {...} args
 */
u.async.Deferred.prototype.hasFired = function(args) {};

var Zlib = {
  Inflate: function() {}
};

Zlib.Inflate.decompress = function() {};
