'use strict';


/** @const */
var INNER_FIELD = '_inner';


/*
 * @param {!function} Wrapper The wrapper on which the new prototype will be defined.
 * @param {!string} fnName Fonction name to be wrapped in a new prototype.
 * @param {!Object} options
 **/
function addPrototype(Wrapper, fnName, options) {
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
        args.push(wrapDoneWithTransformations(done, options.transformations, wrapper));
      } else {
        args.push(done);
      }

      inner[fnName].apply(inner, args);
    }
  }
};


/*
 * @param {!function} done A done function to be wrapped.
 * @param {!Array<Object<number, function>>} transformations
 * @param {!Object} wrapper Wrapper instance used to contextualize transformations.
 * @return {function} A wrapped done function with transformations.
 **/
function wrapDoneWithTransformations(done, transformations, wrapper) {
  return function() {
    var args = new Array(arguments.length);
    for(var i = 0; i < args.length; ++i) {

      var transformation = transformations[i];
      if(!transformation) {
        // No transformation has been found
        args[i] = arguments[i];
        continue;
      }

      args[i] = transformation.call(wrapper, arguments[i]);
    }

    done.apply(null, args);
  }
}


/*
 * @param {function} Wrapper Wrapper The wrapper on which the new prototypes will be defined.
 * @param {(Array<string>|string)} fnNames Fonction names to be wrapped in a new prototype.
 * @param {Object=} options
 **/
exports.addPrototypes = function(Wrapper, fnNames, options) {
  if(!Array.isArray(fnNames)) {
    fnNames = [fnNames];
  }

  if(!options) {
    // Default value
    options = {};
  }

  fnNames.forEach(function(fnName) {
    addPrototype(Wrapper, fnName, options);
  });
};
