let OVERLAY_API_BASE_URL = 'https://piscine-monsieur-91924.herokuapp.com/api';
let RESOURCE_POLL_TIMEOUT = 2000;
let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

function ebsReq(ajaxParam)
{
	ajaxParam.headers = ajaxParam.headers ? ajaxParam.headers : {};
	ajaxParam.headers.Authorization = 'Bearer ' + token;
	$.ajax(ajaxParam);
}

function pollResourcesPeriodically()
{
	if(!token) { 
		setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		return;
	}
	
	ebsReq({
		url: OVERLAY_API_BASE_URL + '/display?timestamp' + new Date().getTime(),
		type: 'GET',
		success: function(data) {

			$('.resource').righteousToggle(data.state);
			if (data.state) {
			    $('.minimap-click-data, .minimap, .command-card-click-data, .command-card').righteousToggle(data.map);
			    if (data.map && $('.minimap').length > 0) {
			        $('.minimap').scaleToRatio(data.map.ratio ? data.map.ratio : 1);
			    }

                setStanceText(data.state.stance);
			    setFocusText(data.state.focus);

				$('.gas .value').numberChange(data.state.gas);
				$('.minerals .value').numberChange(data.state.minerals);
                $('.supply .value').text(data.state.supply);
                $('.terrazine .value').text(data.state.terrazine);

                $('.feeding').righteousToggle(data.state.feeding);
                $('.resource.income').righteousToggle(!data.state.feeding);

                $('.feeding .value').text(data.state.feeding);
                $('.gas-income .value').taxColor(data.state.gasTax).numberChange(data.state.gasIncome, '+');
                $('.minerals-income .value').taxColor(data.state.mineralsTax).numberChange(data.state.mineralsIncome, '+');

                if (data.state.workers)
                {
                    $('.workers-minerals .value').numberChange(data.state.workers.minerals);
                    $('.workers-gas .value').numberChange(data.state.workers.gas);
                    $('.workers-moving .value').numberChange(data.state.workers.moving);
                    $('.workers-idle .value').numberChange(data.state.workers.idle, '', function(e, val) {
                        e.toggleClass("value-warn", val > 0);
                    });
                }

                $('.sellout').righteousToggle(data.sellout);

                data.events.map(event => renderPersonalEvent(event));
            }
            else
            {
                // reinitialize all the text boxes
                $('.feeding').righteousToggle(false);
                $('.resource .value').text('0').prop('Counter', '0');
                $('.income .value').text('+0').prop('Counter', '0').taxColor(0);
                $('#extension-hint').righteousToggle(data.globalMessage && data.globalMessage.endsWith('identify you'));
                $('.stance, .focus').html('');
            }

            $('.message').text(data.globalMessage);

			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
}

function setStanceText(stanceString) {
    let stanceElement = $('.stance').html('');
    if (stanceString) {
        $('<span/>').css('color', "lightblue").text('stance: ').appendTo(stanceElement);
        stanceElement.append(stanceString);
    }
}

function setFocusText(focusString) {
    let focusElement = $('.focus').html('');
    if (focusString) {
        $('<span/>').css('color', "lightblue").text('focus: ').appendTo(focusElement);
        focusElement.append(focusString);
    }
}

function toggleMode(joined){
	$('.resource').righteousToggle(joined);
	$('.minimap-click-data, .minimap, .command-card-click-data, .command-card').righteousToggle(joined);
	$('.message').righteousToggle(!joined);
}

$.fn.extend({
	righteousToggle: function(show) { // avoids triggering show animation when not necessary
		if ($(this).is(':visible') && !show) {
			$(this).hide();
		} else if ($(this).is(':hidden') && show) {
			$(this).show();
		}
		return this;
	},
	numberChange: async function(newNumber, str, onstep) {
	    if (!document.hidden ) {
            $(this).prop('Counter', $(this).text()).stop().animate({ Counter: newNumber }, {
                duration: 800,
                easing: 'swing',
                step: function (now) {
                    $(this).text((str ? str : '') + Math.ceil(now));
                    if (onstep) onstep($(this), Math.ceil(now));
                }
            });
        }
        return this;
    },
	rgbColor: function(r, g, b) {
		return $(this).css("color", "rgb(" + r + "," + g + "," + b + ")");
	},
	whiteColor: function() {
	    return $(this).rgbColor(255, 255, 255);
	},
	taxColor: function(tax) {
	    if (!tax)
	    {
	        return $(this).whiteColor();
	    }
	    var r = 255;
        var g = 255 - Math.max(5 * tax - 245, 0);
        var b = 255 - Math.min(5 * tax, 255);
        return $(this).rgbColor(r, g, b);
	},
	mouseCoords(event, scaleWidth, scaleHeight) {
        var posX = event.pageX - $(this).position().left;
        var posY = event.pageY - $(this).position().top;

        var myX = Math.floor(posX * scaleWidth / $(this).width() + 1);
        var myY = Math.floor(scaleHeight - posY * scaleHeight / $(this).height());
        return {x: myX, y: myY};
    },
	trackClicks: function(valueHolder, valueDisplayFn, valueClipFn, scaleWidth, scaleHeight) {
	    $(this).mouseout(function(event) {
	        valueHolder.text('');
	    }).mousemove(function(event) {
	        var crds = $(this).mouseCoords(event, scaleWidth, scaleHeight);
	        var str = valueDisplayFn(crds);
	        valueHolder.text(str);
	    }).click(function (event) {
	        if (event.which == 1) {
	            var crds = $(this).mouseCoords(event, scaleWidth, scaleHeight);
            	valueClipFn(crds);
            }
	    });
	},
	percentWidth: function() {
	    return 100 * $(this).width() / $(window).width();
	},
	percentHeight: function() {
        return 100 * $(this).height() / $(window).height();
    },
    percentLeft: function() {
        return 100 * $(this).position().left / $(window).width();
    },
    percentTop: function() {
        return 100 * $(this).position().top / $(window).height();
    },
    percentValue: function(prop, newVal) {
         return $(this).css(prop, newVal + '%');
    },
	scaleToRatio: function(ratioW2H) { // preserves the center
	    var originalPosition;
        var originalDimensions;
	    if (!$(this).attr('originalPosition')) { // store the original values
	        originalPosition = {left: $(this).percentLeft(), top: $(this).percentTop()};
	        originalDimensions = {width: $(this).percentWidth(), height: $(this).percentHeight()};
	        $(this).attr('originalPosition', JSON.stringify(originalPosition));
	        $(this).attr('originalDimensions', JSON.stringify(originalDimensions));
	    } else { // reset to original dimensions first
	         originalPosition = JSON.parse($(this).attr('originalPosition'));
             originalDimensions = JSON.parse($(this).attr('originalDimensions'));
             $(this).percentValue('left', originalPosition.left);
             $(this).percentValue('top', originalPosition.top);
             $(this).percentValue('width', originalDimensions.width);
             $(this).percentValue('height', originalDimensions.height);
	    }

	    if (ratioW2H > 1) { // apply the ratio thingy
            let originalHeight = originalDimensions.height;
	        let newHeight = originalHeight / ratioW2H;
	        $(this).percentValue('top', originalPosition.top + ((originalHeight - newHeight) / 2));
	        $(this).percentValue('height', newHeight);
	    } else if (ratioW2H < 1) {
	        let originalWidth = originalDimensions.width;
	        let newWidth = originalWidth * ratioW2H;
	        $(this).percentValue('left', originalPosition.left + ((originalWidth - newWidth) / 2));
	        $(this).percentValue('width', newWidth);
	    }
    }
});

let $clipboard = $("<input id='clipboard'>").appendTo('body').righteousToggle(false);
let CLIPBOARD_COMBO_TOKENS = {
    BUILD: { attr: 'b', combo: ['b', 'c']},
    COORDS: { attr: 'c', combo: ['b', 'c']},
    OTHER: { attr: 'o'},
    _clearAllAttributes: function() {
        Object.values(CLIPBOARD_COMBO_TOKENS).map(val => val.attr ? $clipboard.attr(val.attr, '') : null);
    }
};

function copyToClipboard(text, key) {
    $clipboard.attr(key.attr, text);

    var newVal;
    if (key.combo) {
        newVal = key.combo.map(a => $clipboard.attr(a)).join(" ");
    } else {
        newVal = text;
    }

    if (key.timeoutHandle) clearTimeout(key.timeoutHandle);
    key.timeoutHandle = setTimeout(() => $clipboard.attr(key.attr, ''), 3000); // keep last timeout handle for each type of token

    $clipboard.righteousToggle(true).val(newVal.trim()).select();
    document.execCommand("copy");
    $clipboard.righteousToggle(false);
}

$(function () {
    toggleMode(false);
	pollResourcesPeriodically();
	startUpdatingInGameEventsLog();
	$('.minimap').trackClicks($('.minimap-click-data'), crds => (crds.x + " " + crds.y),
	    crds => copyToClipboard("(" + crds.x + " " + crds.y + ")", CLIPBOARD_COMBO_TOKENS.COORDS), 100, 100);
	$('.command-card').trackClicks($('.command-card-click-data'), crds => command(crds).sh,
	    crds => copyToClipboard(command(crds).lg, command(crds).clipToken), 7, 4);
	$("#extension-hint .close").click(() => $("#extension-hint").detach());
});


function command(crds) {
    if (crds.x == 1 && crds.y == 0) return {sh: '!u s', lg: '!upgrade shields', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 1 && crds.y == 1) return {sh: '!u ga', lg: '!upgrade ground_armor', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 1 && crds.y == 2) return {sh: '!u gw', lg: '!upgrade ground_weapons', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};

    if (crds.x == 2 && crds.y == 0) return {sh: '!r wg', lg: '!research warpgate', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 2 && crds.y == 1) return {sh: '!u aa', lg: '!upgrade air_armor', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 2 && crds.y == 2) return {sh: '!u aw', lg: '!upgrade air_weapons', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};

    if (crds.x == 3 && crds.y == 0) return {sh: '!r g', lg: '!research glaive', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 3 && crds.y == 1) return {sh: '!r b', lg: '!research blink', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 3 && crds.y == 2) return {sh: '!r c', lg: '!research charge', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};

    if (crds.x == 4 && crds.y == 0) return {sh: '!r tl', lg: '!research thermal_lance', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 4 && crds.y == 1) return {sh: '!r gd', lg: '!research drive', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 4 && crds.y == 2) return {sh: '!r gb', lg: '!research boosters', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};

    if (crds.x == 5 && crds.y == 1) return {sh: '!r fv', lg: '!research fluxvanes', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};
    if (crds.x == 5 && crds.y == 2) return {sh: '!r pc', lg: '!research crystals', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};

    if (crds.x == 6 && crds.y == 2) return {sh: '!r s', lg: '!research storm', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};

    if (crds.x == 7 && crds.y == 2) return {sh: '!r ss', lg: '!research dark_templar', clipToken: CLIPBOARD_COMBO_TOKENS.OTHER};


    if (crds.x == 1 && crds.y == 3) return {sh: '!b f', lg: '!build forge', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 2 && crds.y == 3) return {sh: '!b cc', lg: '!build core', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 3 && crds.y == 3) return {sh: '!b t', lg: '!build twilight', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 4 && crds.y == 3) return {sh: '!b rb', lg: '!build robo_bay', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 5 && crds.y == 3) return {sh: '!b fb', lg: '!build fleet_beacon', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 6 && crds.y == 3) return {sh: '!b ta', lg: '!build templar_archives', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 7 && crds.y == 3) return {sh: '!b ds', lg: '!build dark_shrine', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};

    if (crds.x == 5 && crds.y == 0) return {sh: '!b g', lg: '!build gateway', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 6 && crds.y == 0) return {sh: '!b r', lg: '!build robo', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};
    if (crds.x == 7 && crds.y == 0) return {sh: '!b s', lg: '!build stargate', clipToken: CLIPBOARD_COMBO_TOKENS.BUILD};

    return {sh: '', lg: null};
}

//----------------------------------
//-------AUTH-----------------------
//----------------------------------
twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
});