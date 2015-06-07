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
    addPrototype(Wrapper, fnName, options);
  });
}


/**
 * Add an event prototype used to wrap EventEmitter.on and EventEmitter.once methods.
 *
 * @param {!function} Wrapper The wrapper on which the new prototype will be defined.
 * @param {!string} fnName Original (inner) function name.
 * @param {!Object} options
 */
function addPrototype(Wrapper, fnName, options) {

  var protoName = fnName;

  /**
   * @param {string!} event
   * @param {function=} listener
   * @return {function|null}
   */
  Wrapper.prototype[protoName] = function(event, listener) {
    var inner = this[INNER_FIELD];
    var wrapper = this;

    var eventOptions = options.events[event];
    var transformations = eventOptions
      ? eventOptions.transformations
      : null;


    if(arguments.length == 1) {

      // Method called without listener: Thunk mode
      // Return a generator
      return function(done) {

        inner[fnName].call(inner, event, function() {

          var args = helper.argumentsToArray(
            arguments,
            transformations,
            wrapper);

          args.unshift(null); // Set error to null
          done.apply(null, args);

        });
      };
    }

    // Method called with a listener : Pass through mode
    if(transformations) {
        listener = helper.wrapFunctionWithTransformations(
          listener,
          transformations,
          wrapper);
    }

    inner[fnName].call(inner, event, listener);
  };
}

exports.addPrototypes = addPrototypes;
