(function ( factory, exports ) {

    // Use requirejs if possible
    if ( (typeof define == 'function') && define.amd ) {
        return define('notify-sl', [ 'jquery' ], factory);
    }

    // Try to fetch jquery
    var jq = window.$ || window.jQuery;

    // We really need it
    if ( !jq ) {
        throw new Error("jQuery is required for notify-sl");
    }

    // Let's export it the normal way
    exports.notifysl = factory(jq);

})(function ( $ ) {

    // Generates a unique ID on the page
    var uniqueId = <?php include("unique-id.js"); ?>;

    // Allow attaching events to almost any object
    var eventObject = <?php include("event-object.js"); ?>;

    // Our module
    var notify = eventObject(function () {
        return notify.open.apply(null, arguments);
    });

    // Keep a reference to the body
    // We'll use it more often
    var $body = $(document.body);

    // Build CSS element
    var $css       = $("#notify-sl-css");
    $css           = $css.length && $css || $('<style id="notify-sl-css"></style>');
    $body.append($css);
    $css.html(
        '#notify-sl-container {' +
            'padding:'  + '0;' +
            'position:' + 'fixed;' +
            'right:'    + '1em;' +
            'top:'      + '0;' +
        '}' +

        '#notify-sl-container:after {' +
            'clear:'      + 'both;' +
            'content:'    + '".";' +
            'display:'    + 'block;' +
            'height:'     + '0;' +
            'visibility:' + 'hidden;' +
        '}');

    // Create a container for our notifications
    var container = $("#notify-sl-container");
    container     = container.length && container || $('<div id="notify-sl-container"></div>');
    $body.append(container);

    notify.animateDuration = 250;
    notify.openBoxes       = {};
    notify.style           = {
        'background': document.body.style.background || '#1f1d1d',
        'border'    : '1px solid #292929',
        'color'     : document.body.style.color || '#FFF',
        'margin-top': '1em',
        'padding'   : '1em',
        'position'  : 'relative',
        'z-index'   : 1060
    };

    // Close a single notification
    function close( box, callback ) {
        delete notify.openBoxes[ box.id ];
        $(box).css({ right: -box.offsetWidth });
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
            $box     = $(box),
            callback = options.callback || function () {};

        box.id         = uniqueId();
        box.dataset.cb = callback;
        $box.addClass('notify-box');

        // Make sure we can close again
        if ( !options.buttons && !options.timeout ) {
            throw new Error("Either buttons or timeout required");
        }

        // Run some styling on the box
        $box.css(notify.style);
        if ( options.style ) {
            $box.css(options.style);
        }

        // Either provided contents or texts
        if ( options.contents ) {
            $box.append(options.contents);
        } else {
            // Build title/message structure
            var title    = document.createElement("h2"),
                message  = document.createElement("p"),
                $title   = $(title),
                $message = $(message);
            //translate sentence
            $title.text(notify.trigger('locale', options.title || ""));
            $message.text(notify.trigger('locale', options.message || ""));
            $title.css({ marginTop: '0' });
            // Append message to notification box
            if ( $title.text().length )   $box.append($title);
            if ( $message.text().length ) $box.append($message);
        }

        // Handle buttons
        if ( options.buttons ) {
            var firstButton = true;
            $.each(options.buttons, function ( text, value ) {
                var $button = $(document.createElement("button"));

                //translate sentence
                $button
                    .addClass('btn')
                    .addClass('btn-default')
                    .text(notify.trigger('locale', text));

                if ( firstButton ) {
                    $button.addClass('btn-primary');
                    firstButton = false;
                }

                // Attach callbacks
                $button
                    .on('click', callback.bind(null, value))
                    .on('click', function () {
                        box.dataset.cb = '';
                        close(box);
                    });
                $box.append($button);
            });
        }

        // Let's show the box
        container.append($box);
        notify.openBoxes[ box.id ] = box;

        // Animate into view
        $box
            .css({ left: '-100%' })
            .css({ left: '', right: -box.offsetWidth })
            .css({ transition: 'right ' + notify.animateDuration + 'ms ease' });
        setTimeout(function () {
            $box.css({ right: '0' })
                .each(function () {
                    if ( options.timeout ) {
                        setTimeout(function () {
                            close(box, callback.bind(null, 'timeout'));
                        }, options.timeout)
                    }
                })
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
            buttons : data.timeout && {} || { ok: true },
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
            buttons : { 'labels.ok': true, 'labels.cancel': false },
            title     : title,
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

        var $title   = $("<h2></h2>"),
            $message = $("<p></p>");
        $title.text(notify.trigger('locale', title || ''));
        $message.text(notify.trigger('locale', message || ''));

        var $form  = $("<form onsubmit='return false;'></form>");
        var $input = $('<input/>');
        Object.keys(data).forEach(function ( key ) {
            $input.prop(key, data[ key ]);
        });
        $input.prop('name', 'prompt');
        $form.addClass('');
        $form.append($input);

        if ( $title.text().length )   contents.push($title);
        if ( $message.text().length ) contents.push($message);
        contents.push($form);

        notify.open({
            closeAll: true,
            buttons : { 'ok': true, 'cancel': false },
            contents: contents,
            callback: function ( value ) {
                if ( value ) {
                    callback($input.val());
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
