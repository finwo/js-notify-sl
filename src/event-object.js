(function() {
  var listeners = ('function' === typeof Symbol) ? Symbol('listeners') : (function() {
    var i = 12, output = '\0';
    while (i--)
      output += Math.floor(Math.random() * 36 * 36).toString(36);
    return output;
  })();
  var apply = function(subject) {
    subject = subject || {};
    subject[listeners] = {};
    subject.__proto__ = Object.assign({},subject.__proto__,apply.fn);
    return subject;
  };
  apply.fn = {
    emit: function(name,args) {
      args = [].slice.call(arguments);
      (this[listeners][name]||[]).forEach(function(cb) {
        cb.apply(undefined,args);
      });
    },
    on: function(name, callback) {
      (this[listeners]=this[listeners][name]||[]).push(callback);
      return this;
    }
  };
  apply.fn.trigger = apply.fn.emit;
  return apply;
})()
