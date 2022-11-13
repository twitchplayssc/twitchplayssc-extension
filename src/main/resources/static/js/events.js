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
            var className = tt[0];
            var parentElement = $('<span/>').addClass(className);

            if (["minerals", "gas", "supply", "terrazine"].includes(className)) {
                var race = PLAYER_GLOBAL_DATA.race;
                var iconEl = $('<span/>').addClass("inlineIcon").css("background-position-y", (51 * (race - 1)) + "%");
                var textClass = (className == "supply") ? RACE_CLASSES[race] : className;
                var textEl = $('<span/>').addClass(textClass).text(tt[1]);
                parentElement.append(iconEl).append(textEl);
            } else {
                parentElement.text(tt[1]); // safe injection, jquery escapes here
            }
            parentElement.appendTo(result.el);
        } else {
            $('<span/>').text(tt[0]).appendTo(result.el); // safe injection, jquery escapes here
        }
    }
    return result;
}

function wrap(text, clazz) {
    return '<span class=' + clazz + '>' + text + '</span>';
}

function wrap(text, flag) {
    return '<span class=' + clazz + '>' + text + '</span>';
}

function startUpdatingInGameEventsLog() {
    const EVENT_LIFETIME = 100000;
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