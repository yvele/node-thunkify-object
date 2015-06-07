'use strict';

var functionWrapper = require('./functionWrapper');
var eventWrapper = require('./eventWrapper');


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
  var options = normalizeAddOptions(options);

  functionWrapper.addPrototypes(
    this.Wrapper,
    methods,
    options);

  return this;
};


/**
 * @param {(Array<string>|string)} methods
 * @param {Object=} options Pass through options.
 * @return {Wrapper} Provides chainability.
 */
WrapperBuilder.prototype.addPassThrough = function(methods, options) {
  var self = this;

  if(!options) {
    // Normalize
    options = {};
  }

  if(!Array.isArray(methods)) {
    methods = [methods];
  }

  methods.forEach(function(method) {
    functionWrapper.addSyncPrototype(self.Wrapper, method, options);
  });

  return self;
};


/**
 * @param {(Array<string>|string)} methods
 * @param {Object=} options
 * @return {Wrapper} Provides chainability.
 */
WrapperBuilder.prototype.addEvent = function(methods, options) {
  var options = normalizeAddEventOptions(options);

  eventWrapper.addPrototypes(
    this.Wrapper,
    methods,
    options);

  return this;
};


/**
 * @return {function} The wrapper constructor.
 */
WrapperBuilder.prototype.getWrapper = function() {
  return this.Wrapper;
};


/**
 * @param {Object=} options
 * @return {Object} Options
 */
function normalizeAddOptions(options) {
  if(!options) {
    // Default value
    options = {};
  }

  if(options.sync === true) {
    // Normalization
    options.sync = {};
  }

  if(options.sync && !options.sync.prototypeNameFormat) {
    // Default value
    options.sync.prototypeNameFormat = '%sSync';
  }

  return options;
}


/**
 * @param {Object=} options
 * @return {Object} Options
 */
function normalizeAddEventOptions(options) {
  if(!options) {
    // Default value
    options = {};
  }

  if(!options.events) {
    // Default value
    options.events = {};
  }

  return options;
}


exports.WrapperBuilder = WrapperBuilder;
