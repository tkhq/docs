"use strict";

var _vitest = require("vitest");
var _helpers = require("../../helpers");
(0, _vitest.describe)('createErrorInstances', function () {
  (0, _vitest.it)('should not show duplicate values under allowed values', function () {
    var errors = (0, _helpers.createErrorInstances)({
      children: {},
      errors: [{
        keyword: 'enum',
        params: {
          allowedValues: ['one', 'two', 'one']
        }
      }, {
        keyword: 'enum',
        params: {
          allowedValues: ['two', 'three', 'four']
        }
      }]
    }, {});
    (0, _vitest.expect)(errors).toMatchInlineSnapshot("\n      [\n        EnumValidationError {\n          \"colorize\": true,\n          \"data\": undefined,\n          \"jsonAst\": undefined,\n          \"jsonRaw\": undefined,\n          \"name\": \"EnumValidationError\",\n          \"options\": {\n            \"keyword\": \"enum\",\n            \"params\": {\n              \"allowedValues\": [\n                \"one\",\n                \"two\",\n                \"three\",\n                \"four\",\n              ],\n            },\n          },\n          \"schema\": undefined,\n        },\n      ]\n    ");
  });
});