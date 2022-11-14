function renderPersonalEvent(str) {
    const MAX_EVENTS = 1;
    var logElement = $('.in-game-events-widget > .log');
    let time = new Date().getTime();

    var parsedEvent = parseEvent(str);
    var rt = $('<div/>').addClass("event")
        .addClass("scale-up-bottom").addClass(parsedEvent.attr('class'))
        .attr('data', time)
        .html(parsedEvent.html()).appendTo(logElement);

    var allEvents = logElement.find('.event');
    var excessElements = Math.max(allEvents.length - MAX_EVENTS, 0);
    allEvents.slice(0, excessElements).remove();  // if we reached MAX_EVENTS, remove old events which still haven't faded out
}

/*
        /flag/flag2 asdasd #{|}# asdasdasd
*/
function parseEvent(str) {
    var result = $('<div/>');

    let firstSpaceIndex = str.indexOf(' ');
    var firstWord = str.substring(0, firstSpaceIndex);
    if (firstWord.startsWith("/")) {
        result.addClass(firstWord.split("/").join(' '));
        str = str.substring(firstSpaceIndex + 1);
    }

    result.richText(str);
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