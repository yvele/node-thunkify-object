# thunkify-object

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

  We first need to create the wrapper once for all future instances.

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

  TODO

# License

  MIT
