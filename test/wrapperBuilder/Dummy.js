
function Dummy(cp) {
  this._cp = cp;
}

Dummy.prototype.doNoParams = function(callback) {
  var self = this;

  setTimeout(function() {
    var res = self._cp;
    callback(null, res);
  }, 1);
}

Dummy.prototype.doWithMultipleResults = function(callback) {
  var self = this;

  setTimeout(function() {
    callback(null, 'RES1', 'RES2');
  }, 1);
}

Dummy.prototype.doWithParams = function(p1, p2, callback) {
  var self = this;

  setTimeout(function() {
    var res = p1 + ' ' + p2 + ' ' + self._cp;
    callback(null, res);
  }, 1);
}

Dummy.prototype.doNoCallback = function(p1) {
  var self = this;

  return self._cp + ' ' + p1;
}

Dummy.prototype.doNoCallbackNoParams = function() {
  var self = this;

  return self._cp;
}

exports.Dummy = Dummy;
