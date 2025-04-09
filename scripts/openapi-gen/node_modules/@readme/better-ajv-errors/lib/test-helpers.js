"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFixturePath = getFixturePath;
exports.getSchemaAndData = getSchemaAndData;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodePath = _interopRequireDefault(require("node:path"));
function getFixturePath(dir, name, file) {
  return _nodePath["default"].join.apply(_nodePath["default"], (0, _toConsumableArray2["default"])([dir, '..', '__fixtures__', name, file].filter(Boolean)));
}
function getSchemaAndData(_x, _x2) {
  return _getSchemaAndData.apply(this, arguments);
}
function _getSchemaAndData() {
  _getSchemaAndData = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(name, dirPath) {
    var schemaPath, schema, dataPath, json, data;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          schemaPath = getFixturePath(dirPath, name, 'schema.json');
          _context.next = 3;
          return _promises["default"].readFile(schemaPath, 'utf8').then(JSON.parse);
        case 3:
          schema = _context.sent;
          dataPath = getFixturePath(dirPath, name, 'data.json');
          _context.next = 7;
          return _promises["default"].readFile(dataPath, 'utf8');
        case 7:
          json = _context.sent;
          data = JSON.parse(json);
          return _context.abrupt("return", [schema, data, json]);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _getSchemaAndData.apply(this, arguments);
}