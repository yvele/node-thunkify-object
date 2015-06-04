# thunkify-object
  [![NPM version][npm-version-image]][npm-url]
  [![MIT License][license-image]][license-url]
  [![Build Status][travis-image]][travis-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

  Wrap an object with callbacks functions into a wrapper with thunk returning functions,
  useful for generator-based flow control such as [co](https://github.com/visionmedia/co).

## Installation

```
$ npm install thunkify-object --save
```

## Examples

### Basic

  Let's say you have a constructor with async functions that uses callbacks.

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

## Running tests

```
$ make test
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
