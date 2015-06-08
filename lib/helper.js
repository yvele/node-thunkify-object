'use strict';


/**
 * @param {!function} fn The function to be wrapped.
 * @param {!Array<Object<number, function>>} transformations
 * @param {!Object} wrapper Wrapper instance used to contextualize transformations.
 * @return {function} A wrapped function with transformations.
 */
function wrapFunctionWithTransformations(fn, transformations, wrapper) {
  return function() {
    var args = argumentsToArray(
      arguments,
      transformations,
      wrapper);

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

  if(transformations && transformations.post) {
    // Call post transformation on all args
    args = transformations.post.call(wrapper, args);
  }

  return args;
}

exports.wrapFunctionWithTransformations = wrapFunctionWithTransformations;
exports.argumentsToArray = argumentsToArray;
