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
var _base = _interopRequireDefault(require("./base"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PatternValidationError = exports["default"] = /*#__PURE__*/function (_BaseValidationError) {
  function PatternValidationError() {
    var _this;
    (0, _classCallCheck2["default"])(this, PatternValidationError);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, PatternValidationError, [].concat(args));
    _this.name = 'PatternValidationError';
    _this.options.isIdentifierLocation = true;
    return _this;
  }
  (0, _inherits2["default"])(PatternValidationError, _BaseValidationError);
  return (0, _createClass2["default"])(PatternValidationError, [{
    key: "print",
    value: function print() {
      var _this$options = this.options,
        message = _this$options.message,
        params = _this$options.params,
        propertyName = _this$options.propertyName;
      var colorizer = this.getColorizer();
      var output = ["".concat(colorizer.red("".concat(colorizer.bold('PROPERTY'), " ").concat(message)), "\n")];
      return output.concat(this.getCodeFrame("must match pattern ".concat(colorizer.magentaBright(params.pattern)), propertyName ? "".concat(this.instancePath, "/").concat(propertyName) : this.instancePath));
    }
  }, {
    key: "getError",
    value: function getError() {
      var _this$options2 = this.options,
        params = _this$options2.params,
        propertyName = _this$options2.propertyName;
      return _objectSpread(_objectSpread({}, this.getLocation()), {}, {
        error: "".concat(this.getDecoratedPath(), " Property \"").concat(propertyName, "\" must match pattern ").concat(params.pattern),
        path: this.instancePath
      });
    }
  }]);
}(_base["default"]);
module.exports = exports.default;