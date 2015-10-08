/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/30/2015
 * Time: 1:18 PM
 */

goog.require('bigwig.DataRecord');

goog.exportSymbol('bigwig.DataRecord', bigwig.DataRecord);

/*goog.exportPropertyGetter = function(obj, propertyName, getter) {
  if (Object.getOwnPropertyDescriptor(obj, propertyName) == undefined) {
    Object.defineProperty(obj, propertyName, {get: getter});
  }
};

goog.exportPropertyGetter(bigwig.DataRecord.prototype, 'chrName', function() { return bigwig.DataRecord.prototype.chrName.call(this); });

if (Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'chrName') == undefined) {
  Object.defineProperty(bigwig.DataRecord.prototype, 'chrName', {
    get: function() { return this.chrName; }
  });
}*/

/*Object.defineProperties(bigwig.DataRecord.prototype, {
  'chrName': { get: function() { return this.chrName; },
  'chr': Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'chr'),
  'start': Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'start'),
  'end': Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'end'),
  'value': Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'value')
});*/

/*
goog.exportProperty(bigwig.DataRecord.prototype, 'chrName', Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'chrName'));
goog.exportProperty(bigwig.DataRecord.prototype, 'chr', Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'chr'));
goog.exportProperty(bigwig.DataRecord.prototype, 'start', Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'start'));
goog.exportProperty(bigwig.DataRecord.prototype, 'end', Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'end'));
goog.exportProperty(bigwig.DataRecord.prototype, 'value', Object.getOwnPropertyDescriptor(bigwig.DataRecord.prototype, 'value'));
*/

