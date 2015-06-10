"use strict";

var functionWrapper = require("./functionWrapper");
var eventWrapper = require("./eventWrapper");

/** @const */
var INNER_FIELD = "_inner";

/**
 * @class
 */
function WrapperBuilder () {

  /**
   * @class
   * @param {!Object} inner The instance to wrap.
   * @private
   */
  this.Wrapper = function (inner) {

    /** @private */
    this[INNER_FIELD] = inner;
  };
}

/**
 * @param {Object=} options Options.
 * @returns {Object} Options.
 */
function normalizeAddEventOptions (options) {
  var normalizeOptions = options || {};

  normalizeOptions.events = normalizeOptions.events || {};
  return normalizeOptions;
}

/**
 * @param {Object=} options Options.
 * @returns {Object} Options.
 */
function normalizePassThroughOptions (options) {
  return options || {};
}

/**
 * @param {Object=} options Options.
 * @returns {Object} Options.
 */
function normalizeAddOptions (options) {
  var normalizeOptions = options || {};

  if (normalizeOptions.sync === true) {
    // Normalization
    normalizeOptions.sync = {};
  }

  if (normalizeOptions.sync && !normalizeOptions.sync.prototypeNameFormat) {
    // Default value
    normalizeOptions.sync.prototypeNameFormat = "%sSync";
  }

  return normalizeOptions;
}

/**
 * @param {(Array<string>|string)} methods A method name or an array of method
 * names.
 * @param {Object=} options Options.
 * @returns {Wrapper} Provides chainability.
 */
WrapperBuilder.prototype.add = function (methods, options) {
  var normalizedOptions = normalizeAddOptions(options);

  functionWrapper.addPrototypes(
    this.Wrapper,
    methods,
    normalizedOptions);

  return this;
};

/**
 * @param {(Array<string>|string)} methods A method name or an array of method
 * names.
 * @param {Object=} options Pass through options.
 * @returns {Wrapper} Provides chainability.
 */
WrapperBuilder.prototype.addPassThrough = function (methods, options) {
  var self = this;
  var normalizedOptions = normalizePassThroughOptions(options);

  var methodNameArray = Array.isArray(methods)
    ? methods
    : [methods];

  methodNameArray.forEach(function (methodName) {
    functionWrapper.addSyncPrototype(
      self.Wrapper,
      methodName,
      normalizedOptions);
  });

  return self;
};

/**
 * @param {(Array<string>|string)} methods A method name or an array of method
 * names.
 * @param {Object=} options Options.
 * @returns {Wrapper} Provides chainability.
 */
WrapperBuilder.prototype.addEvent = function (methods, options) {
  var normalizedOptions = normalizeAddEventOptions(options);

  eventWrapper.addPrototypes(
    this.Wrapper,
    methods,
    normalizedOptions);

  return this;
};

/**
 * @returns {function} The wrapper class.
 */
WrapperBuilder.prototype.getWrapper = function () {
  return this.Wrapper;
};

exports.WrapperBuilder = WrapperBuilder;
