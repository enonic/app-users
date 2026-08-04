var t = require('/lib/xp/testing');
var utils = require('/apis/graphql/utils');

exports.toIntFromNumber = function () {
    t.assertEquals(42, utils.toInt(42));
};

exports.toIntFromString = function () {
    t.assertEquals(42, utils.toInt('42'));
};

exports.toIntNullReturnsDefault = function () {
    t.assertEquals(7, utils.toInt(null, 7));
};
