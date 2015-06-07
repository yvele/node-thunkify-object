'use strict';

var util = require('util');
var helper = require('./helper');

/** @const */
var INNER_FIELD = '_inner';


/**
 * @param {!function} Wrapper The wrapper on which the new prototypes will be defined.
 * @param {!(Array<string>|string)} fnNames Fonction names to be wrapped in a new prototype.
 * @param {!Object} options A valid options object.
 */
function addPrototypes(Wrapper, fnNames, options) {
  if(!Array.isArray(fnNames)) {
    fnNames = [fnNames];
  }

  fnNames.forEach(function(fnName) {

    addThunkPrototype(Wrapper, fnName, options);

    if(options.sync) {
      // Add a synchronous version of the function
      addSyncPrototype(Wrapper, fnName, options.sync);
    }
  });
}


/**
 * Add a synchronous prototype.
 *
 * @param {!function} Wrapper The wrapper on which the new prototypes will be defined.
 * @param {!string} fnName Original (inner) function name.
 * @param {!Object} options A valid options object.
 */
function addSyncPrototype(Wrapper, fnName, options) {
  var protoNameFormat = options.prototypeNameFormat;
  var transformation = options.transformation;

  var protoName = protoNameFormat
    ? util.format(protoNameFormat, fnName)
    : fnName;

  Wrapper.prototype[protoName] = function() {
    var wrapper = this;

    var inner = this[INNER_FIELD];

    // Call the original function
    var res = inner[fnName].apply(inner, arguments);

    if(transformation) {
      res = transformation.call(wrapper, res);
    }

    return res;
  }
}


/**
 * Add a thunk prototype.
 *
 * @param {!function} Wrapper The wrapper on which the new prototype will be defined.
 * @param {!string} fnName Original (inner) function name.
 * @param {!Object} options
 */
function addThunkPrototype(Wrapper, fnName, options) {
  Wrapper.prototype[fnName] = function() {
    var wrapper = this;

    // Bluebird Optimization (http://bit.ly/1cwovPq)
    var args = new Array(arguments.length);
    for(var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    var inner = this[INNER_FIELD];

    return function(done) {

      if(options.transformations) {
        // Wrap done with transformations
        done = helper.wrapFunctionWithTransformations(
          done,
          options.transformations,
          wrapper);
      }

      args.push(done);

      // Call the original function
      inner[fnName].apply(inner, args);
    }
  }
}


exports.addPrototypes = addPrototypes;
exports.addSyncPrototype = addSyncPrototype;
