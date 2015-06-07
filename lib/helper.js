'use strict';


/**
 * @param {!function} fn The function to be wrapped.
 * @param {!Array<Object<number, function>>} transformations
 * @param {!Object} wrapper Wrapper instance used to contextualize transformations.
 * @return {function} A wrapped function with transformations.
 */
function wrapFunctionWithTransformations(fn, transformations, wrapper) {
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

    // Always call with a null context.
    fn.apply(null, args);
  }
}

/**
 * @param {!Object} rawArguments
 * @param {!Array<Object<number, function>>} transformations
 * @param {!Object} wrapper Wrapper instance used to contextualize transformations.
 * @return {Array}
 */
function argumentsToArray(rawArguments, transformations, wrapper) {
  var args = new Array(rawArguments.length);
  for(var i = 0; i < args.length; ++i) {

    var transformation = transformations ? transformations[i] : null;
    if(!transformation) {
      // No transformation has been found
      args[i] = rawArguments[i];
      continue;
    }

    args[i] = transformation.call(wrapper, rawArguments[i]);
  }
  return args;
}

exports.wrapFunctionWithTransformations = wrapFunctionWithTransformations;
exports.argumentsToArray = argumentsToArray;
