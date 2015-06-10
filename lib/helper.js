"use strict";

/**
 * @param {!Object} rawArguments Raw arguments.
 * @param {!Array<Object<number, function>>} transformations Transformations.
 * @param {!Object} wrapper Wrapper instance used to contextualize transformations.
 * @returns {Array} Arguments as an array.
 */
function argumentsToArray (rawArguments, transformations, wrapper) {
  var args = new Array(rawArguments.length);
  var i;
  var currentTransformation;

  for (i = 0; i < args.length; ++i) {
    currentTransformation = transformations ? transformations[i] : null;

    if (!currentTransformation) {
      // No transformation has been found
      args[i] = rawArguments[i];
      continue;
    }

    args[i] = currentTransformation.call(wrapper, rawArguments[i]);
  }

  if (transformations && transformations.post) {
    // Call post transformation on all args
    args = transformations.post.call(wrapper, args);
  }

  return args;
}

/**
 * @param {!function} fn The function to be wrapped.
 * @param {!Array<Object<number, function>>} transformations Transformations.
 * @param {!Object} wrapper Wrapper instance used to contextualize transformations.
 * @returns {function} A wrapped function with transformations.
 */
function wrapFunctionWithTransformations (fn, transformations, wrapper) {
  return function () {
    var args = argumentsToArray(
      arguments,
      transformations,
      wrapper);

    // Always call with a null context.
    fn.apply(null, args);
  };
}

exports.wrapFunctionWithTransformations = wrapFunctionWithTransformations;
exports.argumentsToArray = argumentsToArray;
