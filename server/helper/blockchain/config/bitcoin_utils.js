'use strict'

/**
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.round = function (number, precision) {
    precision = precision ? +precision : 0;

    var sNumber     = number + '',
        periodIndex = sNumber.indexOf('.'),
        factor      = Math.pow(10, precision);

    if (periodIndex === -1 || precision < 0) {
        return Math.round(number * factor) / factor;
    }

    number = +number;
    if (sNumber[periodIndex + precision + 1] >= 5) {
        // Correcting float error
        number += (number < 0 ? -1 : 1) / (factor * 10);
    }

    return +number.toFixed(precision);
}
