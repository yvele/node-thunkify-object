'use strict';

var functionWrapper = require('./functionWrapper');


/** @const */
var INNER_FIELD = '_inner';


/**
 * @constructor
 */
function WrapperBuilder() {
  this.Wrapper = function(inner) {
    this[INNER_FIELD] = inner;
  }
}


/**
 * @param {(Array<string>|string)} methods
 * @param {Object=} options
 * @return {Wrapper} Provides chainability.
 */
 WrapperBuilder.prototype.add = function(methods, options) {

  functionWrapper.addPrototypes(
    this.Wrapper,
    methods,
    options);

  return this;
};


/**
 * @param {(Array<string>|string)} methods
 * @return {Wrapper} Provides chainability.
 */
 WrapperBuilder.prototype.addPassThrough = function(methods) {
  var self = this;

  if(!Array.isArray(methods)) {
    methods = [methods];
  }

  methods.forEach(function(method) {
    functionWrapper.addSyncPrototype(self.Wrapper, method);
  });

  return self;
};


/**
 * @return {function} The wrapper constructor.
 */
 WrapperBuilder.prototype.getWrapper = function() {
  return this.Wrapper;
};


exports.WrapperBuilder = WrapperBuilder;
