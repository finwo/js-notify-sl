(function () {
  
  var module = function () {
    var output = '0';
    while ( !isNaN(output) )                   output  = module.randomChar(); // First char must not be numeric
    while ( output.length < module.minLength ) output += module.randomChar(); // Satisfy minimum length
    while ( document.getElementById(output) )  output += module.randomChar(); // And uniqueness
    return output;
  };
  
  module.randomChar = function () {
    return module.alphabet.charAt(Math.round(Math.random() * (module.alphabet.length - 1)));
  };
  module.minLength  = 8;
  module.alphabet   = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  
  return module;
  
})()
