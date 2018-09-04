// Build by finwo @ di 4 sep 2018 15:38:03 CEST
/** global: define */
/** global: Node   */
(function ( factory ) {

    // Use requirejs if possible
    if ( (typeof define == 'function') && define.amd ) {
        return define('notify-sl', factory);
    }

    // Export for browser/node
    this.notifysl = factory();

    // Export for file inclusions
    return this.notifysl;

})(function () {

    // Generates a unique ID on the page
    var uniqueId = (function () {
  
  var module = function () {
    var output = module.randomChar();
    while ( !isNaN(output) )                   { output  = module.randomChar(); } // First char must not be numeric
    while ( output.length < module.minLength ) { output += module.randomChar(); } // Satisfy minimum length
    while ( document.getElementById(output) )  { output += module.randomChar(); } // And uniqueness
    return output;
  };
  
  module.randomChar = function () {
    return module.alphabet.charAt(Math.round(Math.random() * (module.alphabet.length - 1)));
  };
  module.minLength  = 8;
  module.alphabet   = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  
  return module;
  
})()
;

    // Allow attaching events to almost any object
    var eventObject = function(sourceObject) {
  var listeners = {};
  sourceObject = sourceObject || {};
  sourceObject.trigger = function(name, data) {
    data = ( typeof data == 'string' ) ? data : data || true;
    (listeners[name]||[]).forEach(function(callback) {
      data = data && callback(data);
    });
    return data;
  };
  sourceObject.on = function(name, callback) {
    (listeners[name]=listeners[name]||[]).push(callback);
    return sourceObject;
  };
  return sourceObject;
}
;

    // Helper functions
    function getElement( tag, id ) {
        tag = tag.toUpperCase();
        var element = document.getElementById(id) || document.createElement(tag);
        element.id = id;
        document.body.appendChild(element);
        return element;
    }

    function append( element, contents ) {
        if ( Array.isArray(contents) ) { return contents.map(append.bind(null,element)); }
        if ( 'string' == typeof contents ) { return element.innerHTML += contents; }
        if ( contents instanceof Node ) { return element.appendChild(contents); }
        return false;
    }

    function on( element, event, handler ) {
        if ( Array.isArray(event) )   { return event.map(function(e) { return on(element,e,handler); }); }
        if ( Array.isArray(handler) ) { return handler.map(on.bind(null,element,event)); }
        if ( 'function' != typeof handler ) { return false; }
        if ( element.addEventListener ) {
            return element.addEventListener(event, handler);
        } else if ( element.attachEvent ) {
            return element.attachEvent( 'on' + event, handler );
        } else {
            return false;
        }
    }

    function getStyle( element, property ) {
      if ( element.currentStyle ) {
        return element.currentStyle[property];
      }
      return document.defaultView.getComputedStyle(element)[property];
    }

    // Our module
    var notify = eventObject(function () {
        return notify.open.apply(null, arguments);
    });

    // Fetch some stuff for styling
    function compileStyle(style) {
        return Object.keys(style).map(function(property) {
          return property+':'+style[property];
        }).join(';');
    }

    // Element to fetch styling from
    var testElement =
          document.getElementById('notify-style') ||
          (document.getElementsByTagName('main')||[])[0] ||
          (document.getElementsByTagName('form')||[])[0] ||
          document.body;

    var style = {
        container     : {
            'padding' : '0',
            'position': 'fixed',
            'right'   : '0',
            'top'     : '0',
            'z-index' : '1060',
        },
        containerAfter: {
            'clear'     : 'both',
            'content'   : '"."',
            'display'   : 'block',
            'height'    : '0',
            'visibility': 'hidden',
        },
        notification: {
            'background': getStyle( testElement, 'backgroundColor' ),
            //'border'    : '1px solid '+getStyle( testCard, 'color' ),
            'box-shadow': '0 1px 2px rgba(0,0,0,0.5)',
            'color'     : getStyle( testElement, 'color'),
            'margin-top': '1em',
            'padding'   : '1em',
            'position'  : 'relative'
        },
        notificationParagraph: {
            'margin-bottom': '1em'
        },
        notificationLastChild: {
            'margin-bottom': '0'
        }
    };

      // Build CSS element
    getElement('style', 'notify-sl-css').innerHTML =
        '#notify-sl-container {'          +
            compileStyle(style.container) +
        '}' +

        '#notify-sl-container:after {'         +
            compileStyle(style.containerAfter) +
        '}' +

        '#notify-sl-container .notify-box > p {'      +
            compileStyle(style.notificationParagraph) +
        '}' +

        '#notify-sl-container .notify-box {' +
            compileStyle(style.notification) +
        '}' +

        '#notify-sl-container .notify-box > :last-child {' +
            compileStyle(style.notificationLastChild)      +
        '}';


    // Create a container for our notifications
    var container = getElement('div', 'notify-sl-container');

    notify.animateDuration = 250;
    notify.openBoxes       = {};
    notify.style           = {};

    // Close a single notification
    function close( box, callback ) {
        delete notify.openBoxes[ box.id ];
        box.style.right = `-${box.offsetWidth}px`;
        setTimeout(function () {
            if ( typeof box.dataset.cb == 'function' ) {
                box.dataset.cb(false);
            }
            if ( box.parentNode ) {
                box.parentNode.removeChild(box);
            }
            if ( typeof callback === 'function' ) {
                callback();
            }
        }, notify.animateDuration);
    }

    // Close all notifications
    notify.closeAll = function () {
        Object.keys(notify.openBoxes).forEach(function ( key ) {
            close(notify.openBoxes[ key ]);
        });
    };

    // Open a notification
    notify.open = function ( options ) {

        options = notify.trigger('open', options);

        if ( options.closeAll ) {
            notify.closeAll();
        }

        var box      = document.createElement("div"),
            callback = options.callback || function () {};

        box.id          = uniqueId();
        box.dataset.cb  = callback;
        box.className  += ' notify-box';

        // Make sure we can close again
        if ( !options.buttons && !options.timeout ) {
            throw new Error("Either buttons or timeout required");
        }

        // Run some styling on the box
        box.style = notify.style || {};
        if ( options.style ) {
            Object.keys(options.style).forEach(function(key) {
                box.style[key] = options.style[key];
            });
        }

        // Allow transformations on the data
        options.data = notify.trigger('data', options.data || {});

        // Either provided contents or texts
        if ( options.contents ) {
            append(box,options.contents);
        } else {
            // Build title/message structure
            var title    = document.createElement("h2"),
                message  = document.createElement("p");
            //translate sentence
            append(title,document.createTextNode(notify.trigger('locale', options.title || "")));
            append(message,document.createTextNode(notify.trigger('locale', options.message || "")));
            title.style = title.style || {};
            title.style.marginTop = 0;
            // Append message to notification box
            if ( title.innerHTML   ) { append(box,title);   }
            if ( message.innerHTML ) { append(box,message); }
        }

        // Handle buttons
        if ( options.buttons ) {
            var firstButton = true;

            if ( Array.isArray(options.buttons) ) {
              options.buttons.forEach(function(button) {
                var btn = document.createElement('BUTTON');
                btn.className  = 'btn btn-default';
                if(firstButton) {
                  btn.className += ' btn-primary';
                  firstButton = false;
                }
                if(Array.isArray(button)) {
                  btn.innerText = notify.trigger('locale',button[0]);
                  on(btn,'click',[
                    callback.bind(null,button[1]),
                    function(){box.dataset.cb='';close(box);}
                  ]);
                  if( ('object' === typeof button[2]) && Array.isArray(button[2]) ) {
                    btn.className += ' ' + button[2].join(' ');
                  }
                } else {
                  btn.innerText = notify.trigger('locale',button.text||'');
                  on(btn,'click',[
                    callback.bind(null,button.value||''),
                    function(){box.dataset.cb='';close(box);}
                  ]);
                  if(Array.isArray(button.class)) {
                    btn.className += ' '+button.class.join(' ');
                  }
                }
                append(box,btn);
              });
            } else {
              Object.keys(options.buttons).forEach(function(key) {
                var button = document.createElement('BUTTON'),
                    value  = options.buttons[key];
                button.className = button.className || '';
                switch(typeof value) {
                  case 'object':
                    button.className += ' '+(value.class||'');
                    button.appendChild(document.createTextNode(notify.trigger('locale', value.text || key)));
                    value = ( value.value || key );
                    break;
                  default:
                    button.appendChild(document.createTextNode(notify.trigger('locale', key)));
                    break;
                }
                button.className += ' btn';
                button.className += ' btn-default';
                if ( firstButton ) {
                  button.className += ' btn-primary';
                  firstButton = false;
                }
                on(button,'click', [
                  callback.bind(null,value),
                  function() {
                    box.dataset.cb = '';
                    close(box);
                  }
                ]);
                append(box,button);
              });
            }
        }

        // Let's show the box
        append(container,box);
        notify.openBoxes[ box.id ] = box;

        // Animate into view
        box.style.left       = '-100%';
        box.style.right      = -box.offsetWidth;
        box.style.left       = '';
        box.style.transition = 'right ' + notify.animateDuration + 'ms ease';
        setTimeout(function () {
            box.style.right = '1em';
            if ( options.timeout ) {
                setTimeout(function() {
                    close(box, callback.bind(null, 'timeout'));
                }, options.timeout);
            }
        }, 10);
    };

    // A simple alert
    notify.alert = function ( message, title, data, callback ) {

        if ( typeof data == 'function' ) {
            callback = data;
            data     = {};
        }

        data = data || {};

        notify({
            closeAll: false,
            buttons : data.timeout && {} || ( data.buttons || { 'labels.ok': true } ),
            title   : title,
            message : message,
            callback: callback,
            data    : data,
            timeout : data.timeout || 0
        });
    };

    // Confirm... Yes or no
    notify.confirm = function ( message, title, data, callback ) {

        if ( typeof data == 'function' ) {
            callback = data;
            data     = {};
        }

        data = data || {};

        notify.open({
            closeAll: true,
            buttons : data.buttons || { 'labels.ok': true, 'labels.cancel': false },
            title   : title,
            message : message,
            callback: callback,
            data    : data
        });
    };

    notify.prompt = function ( message, title, data, callback ) {

        if ( typeof data == 'function' ) {
            callback = data;
            data     = {};
        }

        data = data || {};

        // We'll make this worth our while
        var contents = [];

        var elTitle   = document.createElement('H2'),
            elMessage = document.createElement('P');
        append(elTitle,document.createTextNode(notify.trigger('locale', title || '')));
        append(elMessage,document.createTextNode(notify.trigger('locale', message || '')));

        var form = document.createElement('FORM'),
            input = document.createElement('INPUT');
        form.setAttribute('onsubmit', 'return false;');
        Object.keys(data).forEach(function ( key ) {
            input.setAttribute(key, data[key]);
        });
        input.setAttribute('name', 'prompt');
        append(form,input);

        if ( title.innerHTML   ) { contents.push(title  ); }
        if ( message.innerHTML ) { contents.push(message); }
        contents.push(form);

        notify.open({
            closeAll: true,
            buttons : data.buttons || { 'labels.ok': true, 'labels.cancel': false },
            contents: contents,
            callback: function ( value ) {
                if ( value ) {
                    callback(input.value);
                    return true;
                }
                callback(false);
                return true;
            },
            data    : data
        });

    };

    // Return our module
    return notify;
})
