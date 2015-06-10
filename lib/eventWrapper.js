"use strict";

var helper = require("./helper");

/** @const */
var INNER_FIELD = "_inner";

/**
 * Add an event prototype used to wrap EventEmitter.on and EventEmitter.once methods.
 *
 * @param {!function} Wrapper The wrapper on which the new prototype will be defined.
 * @param {!string} fnName Original (inner) function name.
 * @param {!Object} options Options.
 * @returns {void}
 */
function addPrototype (Wrapper, fnName, options) {

  var protoName = fnName;

  /**
   * @param {string!} event Event name.
   * @param {function=} listener Listener.
   * @returns {function|void} The generator function in thunk mode, or nothing.
   */
  Wrapper.prototype[protoName] = function (event, listener) {
    var self = this;
    var inner = self[INNER_FIELD];

    var eventOptions = options.events[event];
    var transformations = eventOptions
      ? eventOptions.transformations
      : null;

    var internalListener;

    if (arguments.length === 1) {

      // Method called without listener: Thunk mode
      // Return a generator
      return function (done) {

        inner[fnName].call(inner, event, function () {

          var args = helper.argumentsToArray(
            arguments,
            transformations,
            self);

          args.unshift(null); // Set error to null
          done.apply(null, args);

        });
      };
    }

    // Method called with a listener : Pass through mode
    if (transformations) {
      internalListener = helper.wrapFunctionWithTransformations(
        listener,
        transformations,
        self);
    } else {
      internalListener = listener;
    }

    inner[fnName].call(inner, event, internalListener);
  };
}

/**
 * @param {!function} Wrapper The wrapper on which the new prototypes will be defined.
 * @param {!(Array<string>|string)} fnNames Fonction names to be wrapped in a new prototype.
 * @param {!Object} options A valid options object.
 * @returns {void}
 */
function addPrototypes (Wrapper, fnNames, options) {
  var fnNameArray = Array.isArray(fnNames) ? fnNames : [fnNames];

  fnNameArray.forEach(function (fnName) {
    addPrototype(Wrapper, fnName, options);
  });
}

exports.addPrototypes = addPrototypes;
