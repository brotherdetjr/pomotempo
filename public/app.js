var app, clock, amountSlider;

var sliderValues = ['5 min', '10 min', '15 min', '20 min', '25 min',
    '30 min', '35 min', '40 min', '45 min', '50 min', '55 min', '1 hour'];

var switchSlider = function() {
    var slider = amountSlider.data('ionRangeSlider');
    slider.update({disable: app._data.running || app._data.stopping});
};

var getTimeFromSlider = function() {
    return (amountSlider.data('from') + 1) * 5 * 60;
};

var setTimeFromSlider = function() {
    clock.setTime(getTimeFromSlider());
};

var toggleTimer = function() {
    if (!app._data.stopping) {
        app._data.running = !app._data.running;
        switchSlider();
        if (app._data.running) {
            clock.start();
        } else {
            clock.stop();
        }
    }
};

app = new Vue({
    el: '#app',
    data: {
        running: false,
        stopping: false
    },
    methods: {
        startStopButtonClick: toggleTimer,
        startStopButtonKeyDown: function(event) {
            if (!this.running) {
                var slider = amountSlider.data('ionRangeSlider');
                var from = slider.old_from;
                var code = event.keyCode;
                if (code == 37 && from > 0) {
                    slider.update({from: from - 1});
                } else if (code == 39 && from < sliderValues.length - 1) {
                    slider.update({from: from + 1});
                } else if (code == 8 || code == 27 || code == 38) {
                    event.preventDefault();
                    $('span#description').click();
                }
            }
        }
    }
});

$(function() {
    clock = $('#timer').FlipClock({
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false,
        callbacks: {
            stop: function() {
                app._data.stopping = true;
                switchSlider();
                setTimeout(function() {
                    app._data.running = false;
                    setTimeFromSlider();
                    app._data.stopping = false;
                    switchSlider();
                    setTimeout(function() { $('#startStopButton').focus(); }, 0);
                }, 1000);
            }
        }
    });
    amountSlider = $('#amount').ionRangeSlider({
        values: sliderValues,
        from: 4,
        force_edges: true,
        onChange: setTimeFromSlider,
        onUpdate: setTimeFromSlider
    });
    setTimeFromSlider();
    $(document).on('click', 'span#description', function() {
        if (!app._data.running) {
            $(this).replaceWith('<input type="text" id="description" value="' + $(this).text() + '" class="form-control-plaintext"/>');
            var input = $('#description');
            var strLength = input.val().length;
            input.focus();
            input[0].setSelectionRange(0, strLength);
            input.keydown(function(e) {
                var start = input[0].selectionStart;
                var end = input[0].selectionEnd;
                if (e.keyCode == 13 || e.keyCode == 27 || e.keyCode == 40 && start == end && start == strLength) {
                    $('#startStopButton').focus();
                    return false;
                }
            });
        }
    }).on('focusout', '#description', function() {
        if (!app._data.running) {
            $(this).replaceWith('<span id="description">' + $(this).val() + '</span>');
        }
    });
    $('span#description').click();

    $(document).unbind('keydown').bind('keydown', function (event) {
        if (event.keyCode === 8) {
            var doPrevent = true;
            var types = ["text", "password", "file", "search", "email", "number", "date", "color", "datetime", "datetime-local", "month", "range", "search", "tel", "time", "url", "week"];
            var d = $(event.srcElement || event.target);
            var disabled = d.prop("readonly") || d.prop("disabled");
            if (!disabled) {
                if (d[0].isContentEditable) {
                    doPrevent = false;
                } else if (d.is("input")) {
                    var type = d.attr("type");
                    if (type) {
                        type = type.toLowerCase();
                    }
                    if (types.indexOf(type) > -1) {
                        doPrevent = false;
                    }
                } else if (d.is("textarea")) {
                    doPrevent = false;
                }
            }
            if (doPrevent) {
                event.preventDefault();
                return false;
            }
        } else if (event.keyCode === 9) {
            event.preventDefault();
            if ($('#startStopButton').is(':focus')) {
                $('span#description').click();
            } else {
                $('#startStopButton').focus();
            }
        } else if (event.keyCode === 27 && app._data.running) {
            toggleTimer();
        }
    });
});
