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
var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _base = _interopRequireDefault(require("./base"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0, _get2["default"])((0, _getPrototypeOf2["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
var RequiredValidationError = exports["default"] = /*#__PURE__*/function (_BaseValidationError) {
  function RequiredValidationError() {
    var _this;
    (0, _classCallCheck2["default"])(this, RequiredValidationError);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, RequiredValidationError, [].concat(args));
    _this.name = 'RequiredValidationError';
    return _this;
  }
  (0, _inherits2["default"])(RequiredValidationError, _BaseValidationError);
  return (0, _createClass2["default"])(RequiredValidationError, [{
    key: "getLocation",
    value: function getLocation() {
      var dataPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.instancePath;
      var _superPropGet2 = _superPropGet(RequiredValidationError, "getLocation", this, 3)([dataPath]),
        start = _superPropGet2.start;
      return {
        start: start
      };
    }
  }, {
    key: "print",
    value: function print() {
      var _this$options = this.options,
        message = _this$options.message,
        params = _this$options.params;
      var colorizer = this.getColorizer();
      var output = ["".concat(colorizer.red("".concat(colorizer.bold('REQUIRED'), " ").concat(message)), "\n")];
      return output.concat(this.getCodeFrame("".concat(colorizer.magentaBright(params.missingProperty), " is missing here!")));
    }
  }, {
    key: "getError",
    value: function getError() {
      var message = this.options.message;
      return _objectSpread(_objectSpread({}, this.getLocation()), {}, {
        error: "".concat(this.getDecoratedPath(), " ").concat(message),
        path: this.instancePath
      });
    }
  }]);
}(_base["default"]);
module.exports = exports.default;