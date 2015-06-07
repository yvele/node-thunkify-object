# thunkify-object
  [![NPM version][npm-version-image]][npm-url]
  [![MIT License][license-image]][license-url]
  [![Build Status][travis-image]][travis-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

  Build full object wrappers that convert regular node methods into methods that return a thunk, useful for generator-based flow control such as [co](https://github.com/visionmedia/co).

## Table of content

- [Installation](#)
- [Examples](#)
 - [Basic](#)
 - [Pass Through](#)
 - [Transformations](#)
 - [Dealing with functions being both async and sync](#)
 - [Events](#)
- [Running tests](#)
- [License](#)

## Installation

```
$ npm install thunkify-object --save
```

## Examples

### Basic

  Let's say you have a constructor with async prototypes using callbacks.

```js
function Dummy() {}

Dummy.prototype.hello = function(callback) {
  setImmediate(callback, null, 'Hello');
}

Dummy.prototype.helloYou = function(you, callback) {
  setImmediate(callback, null, 'Hello ' + you);
}
```

  You first need to create the wrapper constructor once for all future instances.

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var DummyWrapper = new WrapperBuilder()
  .add(['hello', 'helloYou'])
  .getWrapper();
```

  Let's use it with [co](https://github.com/visionmedia/co).

```js
var co = require('co');

co(function* () {
  // Instantiate your wrapper with an instance of the original
  var dummy = new DummyWrapper(new Dummy());

  var a = yield dummy.hello();
  console.log(a); // 'Hello'

  var b = yield dummy.helloYou('World');
  console.log(b); // 'Hello World'
});
```

### Pass Through

  If you want some functions not to change their behavior,
  you can use `addPassThrough` to simply inherit the function in your wrapper.
  This is usefull for synchronous functions that doesn't use callback.

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var DummyWrapper = new WrapperBuilder()
 .add(['hello', 'helloYou'])
 .addPassThrough('helloSync')
 .getWrapper();
```

### Transformations

  For complex objects, the `WrapperBuilder` can apply transformations to callback parameters.

  Let's wrap the [MongoDB native driver](https://github.com/mongodb/node-mongodb-native) as an example.

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var Collection = new WrapperBuilder()
 .add(['add', 'count', 'findOne'])
 .getWrapper();

var Db = new WrapperBuilder()
  .add('collection', {
    transformations: {
      1: function(col) { return new Collection(col); }
    }
  })
  .getWrapper();

var MongoClient = new WrapperBuilder()
  .add('connect', {
    transformations: {
      1: function(db) { return new Db(db); }
    }
  })
  .getWrapper();
```

  Now that you have your wrappers, you can use them like that.

```js
var mongodb = require('mongodb');

function* foo(url) {
  var mongoClient = new MongoClient(mongodb.MongoClient);

  // returned db is a wrapper
  var db = yield mongoClient.connect(url);

  // returned collection is a wrapper
  var collection = yield db.collection('documents');

  yield collection.add({ _id: 1, name: 'Paul Valery' });
  return yield collection.findOne({ _id: 1 });
}
```
  Let's use it with [co](https://github.com/visionmedia/co).

```js
var co = require('co');

co(function* () {
  var doc = yield foo('mongodb://localhost:27017/myproject');
  console.log(doc);
});
```

### Dealing with functions being both async and sync

  Sometimes functions have an optional callback parameter (like [this MongoDB driver method](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#aggregate)). That means when you call it with a callback it's async, but when you call it without a callback it's sync (potentially returning a value).

  Here is how to wrap those functions.

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var Wrapper = new WrapperBuilder()
 .add('helloWithOptionalCallback', {
   sync: true
 })
 .getWrapper();
```

  Any wrapper instance will have 2 explicit methods:
  * `helloWithOptionalCallback` which is async, returning a thunk
  * `helloWithOptionalCallbackSync` which is sync (note the Sync suffix)

The synchronous prototype can be customized with a specific name [format](https://nodejs.org/api/util.html#util_util_format_format) and a transformation.

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var Wrapper = new WrapperBuilder()
 .add('helloWithOptionalCallback', {
   sync: {
     prototypeNameFormat: '%sCustomSuffix',
     transformation: function(res) {
       return res;
     }
   }
 })
 .getWrapper();
```

### Events

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var Wrapper = new WrapperBuilder()
 .addEvent(['on', 'once'])
 .addPassThrough('emit')
 .getWrapper();
```

```js
var EventEmitter = require('events').EventEmitter;
var co = require('co');

co(function* () {

  var e = new Wrapper(new EventEmitter());

  setTimeout(function() {
    e.emit('finish', 'Finish data');
  }, 200);


  var res = yield e.on('finish');
  console.log(res); // 'Finish data'
});
```

Note that you can still pass a listener as a callback:

```js
var EventEmitter = require('events').EventEmitter;
var co = require('co');

co(function* () {

  var e = new Wrapper(new EventEmitter());

  setTimeout(function() {
    e.emit('finish', 'Finish data');
  }, 200);


  e.on('finish', function(res) {
    console.log(res); // 'Finish data'
  });
});
```

If you need transformations, you can define them for each event:

```js
var WrapperBuilder = require('thunkify-object').WrapperBuilder;

var Wrapper = new WrapperBuilder()
 .addEvent(['on', 'once'], {
   events: {
     'finish': transformations: {
       0: function(arg) { return ... },
       1: function(arg) { return ... }
     }
   }
 })
 .addPassThrough('emit')
 .getWrapper();
```

## Running tests

```
$ make test
```

With code coverage.

```
$ make test-cov
```

## License

  Thunkify-object is freely distributable under the terms of the [MIT license](LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/thunkify-object
[npm-version-image]: http://img.shields.io/npm/v/thunkify-object.svg?style=flat

[travis-url]: http://travis-ci.org/yvele/node-thunkify-object
[travis-image]: http://img.shields.io/travis/yvele/node-thunkify-object.svg?style=flat

[coveralls-url]: https://coveralls.io/r/yvele/node-thunkify-object
[coveralls-image]: https://img.shields.io/coveralls/yvele/node-thunkify-object.svg?style=flat
