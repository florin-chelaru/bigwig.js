/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/28/2015
 * Time: 4:54 PM
 */

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
