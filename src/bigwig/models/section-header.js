/**
 * Created by Florin Chelaru ( florin [dot] chelaru [at] gmail [dot] com )
 * Date: 9/24/2015
 * Time: 11:55 PM
 */

goog.provide('bigwig.models.SectionHeader');

goog.require('bigwig.models.BigwigStruct');


/**
 * @constructor
 * @extends {bigwig.models.BigwigStruct}
 */
bigwig.models.SectionHeader = function() {
  bigwig.models.BigwigStruct.apply(this, arguments);
};

goog.inherits(bigwig.models.SectionHeader, bigwig.models.BigwigStruct);

/**
 * @type {Object.<string, number>}
 */
bigwig.models.SectionHeader['Fields'] = {
  chrId: 4,
  start: 4,
  end: 4,
  itemStep: 4,
  itemSpan: 4,
  type: 1,
  reseved: 1,
  itemCount: 2
};

/**
 * @param {ArrayBuffer} data
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.SectionHeader}
 */
bigwig.models.SectionHeader.fromArrayBuffer = function(data, littleEndian) {
  return /** @type {bigwig.models.SectionHeader} */ (bigwig.models.BigwigStruct.fromArrayBuffer(bigwig.models.SectionHeader, bigwig.models.SectionHeader['Fields'] , data, littleEndian));
};

/**
 * @param {DataView} view
 * @param {boolean} [littleEndian]
 * @returns {bigwig.models.SectionHeader}
 */
bigwig.models.SectionHeader.fromDataView = function(view, littleEndian) {
  return /** @type {bigwig.models.SectionHeader} */ (bigwig.models.BigwigStruct.fromDataView(bigwig.models.SectionHeader, bigwig.models.SectionHeader['Fields'] , view, littleEndian));
};
