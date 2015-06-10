"use strict";

var util = require("util");
var helper = require("./helper");

/** @const */
var INNER_FIELD = "_inner";

/**
 * Add a synchronous prototype.
 *
 * @param {!function} Wrapper The wrapper on which the new prototypes will be defined.
 * @param {!string} fnName Original (inner) function name.
 * @param {!Object} options A valid options object.
 * @returns {void}
 */
function addSyncPrototype (Wrapper, fnName, options) {
  var protoNameFormat = options.prototypeNameFormat;
  var transformation = options.transformation;

  var protoName = protoNameFormat
    ? util.format(protoNameFormat, fnName)
    : fnName;

  Wrapper.prototype[protoName] = function () {
    var self = this;
    var inner = self[INNER_FIELD];

    // Call the original function
    var res = inner[fnName].apply(inner, arguments);

    if (transformation) {
      res = transformation.call(self, res);
    }

    return res;
  };
}

/**
 * Add a thunk prototype.
 *
 * @param {!function} Wrapper The wrapper on which the new prototype will be defined.
 * @param {!string} fnName Original (inner) function name.
 * @param {!Object} options
 * @returns {void}
 */
function addThunkPrototype (Wrapper, fnName, options) {
  Wrapper.prototype[fnName] = function () {
    var self = this;
    var inner = self[INNER_FIELD];
    var i;

    // Bluebird Optimization (http://bit.ly/1cwovPq)
    var args = new Array(arguments.length);

    for (i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    return function (done) {
      var callback;

      if (options.transformations) {
        callback = helper.wrapFunctionWithTransformations(
          done,
          options.transformations,
          self);
      } else {
        callback = done;
      }

      args.push(callback);

      // Call the original function
      inner[fnName].apply(inner, args);
    };
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

    addThunkPrototype(Wrapper, fnName, options);

    if (options.sync) {
      // Add a synchronous version of the function
      addSyncPrototype(Wrapper, fnName, options.sync);
    }
  });
}

exports.addPrototypes = addPrototypes;
exports.addSyncPrototype = addSyncPrototype;
