// Build by finwo @ Thu Jun 29 12:26:07 CEST 2017
(function ( factory, exports ) {

    // Use requirejs if possible
    if ( (typeof define == 'function') && define.amd ) {
        return define('notify-sl', factory);
    }

    // Let's export it the normal way
    exports.notifysl = factory(jq);

})(function () {

    // Generates a unique ID on the page
    var uniqueId = (function () {
  
  var module = function () {
    var output = '0';
    while ( !isNaN(output) )                     output  = module.randomChar(); // First char must not be numeric
    while ( output.length < uniqueId.minLength ) output += module.randomChar(); // Satisfy minimum length
    while ( document.getElementById(output) )    output += module.randomChar(); // And uniqueness
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
        if ( Array.isArray(contents) ) return contents.map(append.bind(null,element));
        if ( 'string' == typeof contents ) return element.innerHTML += contents;
        if ( contents instanceof Node ) return element.appendChild(contents);
        return false;
    }

    function on( element, event, handler ) {
        if ( Array.isArray(event) )   return event.map(function(e) { return on(element,e,handler); });
        if ( Array.isArray(handler) ) return handler.map(on.bind(null,element,event));
        if ( 'function' != typeof handler ) return false;
        if ( element.addEventListener ) {
            return element.addEventListener(event, handler);
        } else if ( element.attachEvent ) {
            return element.attachEvent( 'on' + event, handler );
        } else {
            return false;
        }
    }

    // Our module
    var notify = eventObject(function () {
        return notify.open.apply(null, arguments);
    });

    // Build CSS element
    getElement('style', 'notify-sl-css').innerHTML =
        '#notify-sl-container {'   +
            'padding:'  + '0;'     +
            'position:' + 'fixed;' +
            'right:'    + '0;'     +
            'top:'      + '0;'     +
            'z-index:'  + '1060;'  +
        '}' +

        '#notify-sl-container:after {' +
            'clear:'      + 'both;'    +
            'content:'    + '".";'     +
            'display:'    + 'block;'   +
            'height:'     + '0;'       +
            'visibility:' + 'hidden;'  +
        '}' +

        '#notify-sl-container .notify-box > p {' +
            'margin-bottom:' + '1em;'            +
        '}' +

        '#notify-sl-container .notify-box {'                                    +
            'background:' + (document.body.style.background || '#1f1d1d') + ';' +
            'border:'     + '1px solid #292929;'                                +
            'box-shadow:' + '0 0 1em rgba(0,0,0,0.5);'                          +
            'color:'      + (document.body.style.color || '#fff') + ';'         +
            'margin-top:' + '1em;'                                              +
            'padding:'    + '1em;'                                              +
            'position:'   + 'relative;'                                         +
        '}' +

        '#notify-sl-container .notify-box > :last-child {' +
            'margin-bottom:' + '0;'                        +
        '}';

    // Create a container for our notifications
    var container = getElement('div', 'notify-sl-container');

    notify.animateDuration = 250;
    notify.openBoxes       = {};
    notify.style           = {};

    // Close a single notification
    function close( box, callback ) {
        delete notify.openBoxes[ box.id ];
        box.style.right = -box.offsetWidth;
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
            if ( title.innerHTML   ) append(box,title);
            if ( message.innerHTML ) append(box,message);
        }

        // Handle buttons
        if ( options.buttons ) {
            var firstButton = true;
            Object.keys(options.buttons).forEach(function(key) {
                var button = document.createElement('BUTTON');
                button.className = button.className || '';
                button.className += ' btn';
                button.className += ' btn-default';
                button.appendChild(document.createTextNode(notify.trigger('locale', text)));
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

        if ( title.innerHTML   ) contents.push(title  );
        if ( message.innerHTML ) contents.push(message);
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
});
