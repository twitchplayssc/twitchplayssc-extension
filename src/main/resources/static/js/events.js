function renderPersonalEvent(str) {
    const MAX_EVENTS = 1;
    var logElement = $('.in-game-events-widget > .log');
    let time = new Date().getTime();

    var parsedEvent = parseEvent(str);
    var rt = $('<div/>').addClass("event")
        .addClass("scale-up-bottom").addClass(parsedEvent.eventClass)
        .attr('data', time)
        .html(parsedEvent.el.html()).appendTo(logElement);

    var allEvents = logElement.find('.event');
    var excessElements = Math.max(allEvents.length - MAX_EVENTS, 0);
    allEvents.slice(0, excessElements).remove();  // if we reached MAX_EVENTS, remove old events which still haven't faded out
}

/*
        /flag/flag2 asdasd #{|}# asdasdasd
*/
function parseEvent(str) {
    var result = { el: $('<div/>'), eventClass: '' };

    let firstSpaceIndex = str.indexOf(' ');
    var firstWord = str.substring(0, firstSpaceIndex);
    if (firstWord.startsWith("/")) {
        result.eventClass = firstWord.split("/").join(' ');
        str = str.substring(firstSpaceIndex + 1);
    }

    var tokens = str.split(/\{|\}/g);
    for (var i = 0; i < tokens.length; i++) {
        var tt = tokens[i].split(/\|/);
        if (tt.length > 1) {
            $('<span/>').addClass(tt[0]).text(tt[1]).appendTo(result.el); // safe, jquery escapes here
        } else {
            $('<span/>').text(tt[0]).appendTo(result.el); // same
        }
    }
    return result;
}

function parseEvent1(str) {
    var state = 'txt';
    var classBuffer = '';
    var textBuffer = '';
    var buffer;
    var result = { html: '', eventClass: '' };

    let firstSpaceIndex = str.indexOf(' ');
    var firstWord = str.substring(0, firstSpaceIndex);
    if (firstWord.startsWith("/")) {
        result.eventClass = firstWord.split("/").join(' ');
        str = str.substring(firstSpaceIndex + 1);
    }

    function stateChange(st) {
        result.html += buffer.text(textBuffer).html();
        textBuffer = '';
        buffer = $('<span/>');
        state = st;
    }

    for (var i = 0; i < str.length; i++) {
        if (state == 'txt') {
            if (str[i] == '#') {
                stateChange('clz');
                classBuffer = 'inline-wrap-';
            } else {
                textBuffer += str[i];
            }
        } else if ( state == 'clz' ) {
            if (str[i] == '{') {
                classBuffer = '';
                state = 'wrp';
            } else {
                classBuffer += str[i];
            }
        } else if ( state == 'wrp') {
            if ( str[i] == '}' ) {
                result.html += $('<span/>').addClass(classBuffer).text(textBuffer).html();
                state = 'txt';
            } else {
                textBuffer += str[i];
            }
        } else if ( str[i] == '}' ) {
            result.html += $('<span/>').addClass(state).text(buffer).html();
            textBuffer = '';
            state = 'txt';
        } else {
            textBuffer += str[i];
        }
    }

    appendTextBuffer();

    return result;
}

function wrap(text, clazz) {
    return '<span class=' + clazz + '>' + text + '</span>';
}

function wrap(text, flag) {
    return '<span class=' + clazz + '>' + text + '</span>';
}

function startUpdatingInGameEventsLog() {
    const EVENT_LIFETIME = 10000;
    window.setInterval(function() {
        let time = new Date().getTime();
        $('.in-game-events-widget > .log > .event').each(function() {
            let eventTime = parseInt($(this).attr('data'));
            if (time - eventTime > EVENT_LIFETIME) {
                $(this).fadeOut(1000, function() { if ($(this).parent().length > 0) $(this).remove(); });
            }
        });
    }, 200);
}