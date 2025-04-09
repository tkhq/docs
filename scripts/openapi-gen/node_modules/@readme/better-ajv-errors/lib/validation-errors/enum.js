"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _jsonpointer = _interopRequireDefault(require("jsonpointer"));
var _leven = _interopRequireDefault(require("leven"));
var _base = _interopRequireDefault(require("./base"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var EnumValidationError = exports["default"] = /*#__PURE__*/function (_BaseValidationError) {
  function EnumValidationError() {
    var _this;
    (0, _classCallCheck2["default"])(this, EnumValidationError);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, EnumValidationError, [].concat(args));
    _this.name = 'EnumValidationError';
    return _this;
  }
  (0, _inherits2["default"])(EnumValidationError, _BaseValidationError);
  return (0, _createClass2["default"])(EnumValidationError, [{
    key: "print",
    value: function print() {
      var _this$options = this.options,
        message = _this$options.message,
        allowedValues = _this$options.params.allowedValues;
      var colorizer = this.getColorizer();
      var bestMatch = this.findBestMatch();
      var output = ["".concat(colorizer.red("".concat(colorizer.bold('ENUM'), " ").concat(message))), "".concat(colorizer.red("(".concat(allowedValues.join(', '), ")")), "\n")];
      return output.concat(this.getCodeFrame(bestMatch !== null ? "Did you mean ".concat(colorizer.magentaBright(bestMatch), " here?") : 'Unexpected value, should be equal to one of the allowed values'));
    }
  }, {
    key: "getError",
    value: function getError() {
      var _this$options2 = this.options,
        message = _this$options2.message,
        params = _this$options2.params;
      var bestMatch = this.findBestMatch();
      var allowedValues = params.allowedValues.join(', ');
      var output = _objectSpread(_objectSpread({}, this.getLocation()), {}, {
        error: "".concat(this.getDecoratedPath(), " ").concat(message, ": ").concat(allowedValues),
        path: this.instancePath
      });
      if (bestMatch !== null) {
        output.suggestion = "Did you mean ".concat(bestMatch, "?");
      }
      return output;
    }
  }, {
    key: "findBestMatch",
    value: function findBestMatch() {
      var allowedValues = this.options.params.allowedValues;
      var currentValue = this.instancePath === '' ? this.data : _jsonpointer["default"].get(this.data, this.instancePath);
      if (!currentValue) {
        return null;
      }
      var bestMatch = allowedValues.map(function (value) {
        return {
          value: value,
          weight: (0, _leven["default"])(value, currentValue.toString())
        };
      }).sort(function (x, y) {
        return x.weight > y.weight ? 1 : x.weight < y.weight ? -1 : 0;
      })[0];
      return allowedValues.length === 1 || bestMatch.weight < bestMatch.value.length ? bestMatch.value : null;
    }
  }]);
}(_base["default"]);
module.exports = exports.default;