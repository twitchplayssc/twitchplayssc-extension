function renderPersonalEvent(myEvent) {
    const MAX_EVENTS = 2;
    let logElement = $('.in-game-events-widget > .log');

    let parsedEvent = parseEvent(myEvent);
    $('<div/>').addClass("event")
        .addClass("scale-up-bottom").addClass(parsedEvent.attr('class'))
        .attr('created', new Date().getTime())
        .attr('lifetime', myEvent.lifetime) // seconds
        .html(parsedEvent.html())
        .trackClicks($('.command-card-click-data'), crds => {
                return null;
            },
            crds => {
                copyToClipboard(myEvent.copyText, myEvent.clipToken)
            },
            1, 1)
        .appendTo(logElement);

    let allEvents = logElement.find('.event');
    let excessElements = Math.max(allEvents.length - MAX_EVENTS, 0);
    allEvents.slice(0, excessElements).remove();  // if we reached MAX_EVENTS, remove old events which still haven't faded out
}

/*
        /flag/flag2 asdasd #{|}# asdasdasd
*/
function parseEvent(myEvent) {
    let result = $('<div/>');

    let str = myEvent.text;
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
    window.setInterval(function() {
        let time = new Date().getTime();
        $('.in-game-events-widget > .log > .event').each(function() {
            let eventCreated = parseInt($(this).attr('created'));
            let eventLifetime = parseInt($(this).attr('lifetime'));
            if (time - eventCreated > eventLifetime) {
                $(this).fadeOut(1000, function () {
                    if ($(this).parent().length > 0) $(this).remove();
                });
            }
        });
    }, 200);
}