let OVERLAY_API_BASE_URL = 'https://piscine-monsieur-91924.herokuapp.com/api';
let RESOURCE_POLL_TIMEOUT = 2000;
let token = '';
let tuid = '';
let isGameDataApplied = false;

const twitch = window.Twitch.ext;

function ebsReq(ajaxParam)
{
	ajaxParam.headers = ajaxParam.headers ? ajaxParam.headers : {};
	ajaxParam.headers.Authorization = 'Bearer ' + token;
	$.ajax(ajaxParam);
}

function pollResourcesPeriodically(firstCall)
{
	if(!token) { 
		setTimeout(() => pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		return;
	}
	
	ebsReq({
		url: OVERLAY_API_BASE_URL + '/display?timestamp' + new Date().getTime() + (!isGameDataApplied ? "&fetchGlobalGameData=true" : ""),
		type: 'GET',
		success: function(data) {

			$('.resource').righteousToggle(data.state);
            $('.minimap-click-data, .minimap, .command-card-click-data, .command-card').righteousToggle(data.state);
			if (data.state) {
			    if (data.map && $('.minimap').length > 0) {
			        $('.minimap').scaleToRatio(data.map.ratio ? data.map.ratio : 1);
                    isGameDataApplied = true;
			    }
                if (data.commandCard)
                {
                    $('.command-card').css({
                        'border': data.commandCard.debugBorder ? '1px solid white' : 'none',
                        'left': data.commandCard.left,
                        'top': data.commandCard.top,
                        'width': data.commandCard.width,
                        'height': data.commandCard.height
                    }).show().trackClicks($('.command-card-click-data'), crds => {
                            var cell = data.commandCard.cells[crds.x + "," + crds.y];
                            return cell ? cell.tip : '';
                        },
                        crds => {
                            var cell = data.commandCard.cells[crds.x + "," + crds.y];
                            if (cell) {
                                copyToClipboard(cell.copyText, cell.clipToken)
                            }
                        }, 
                        data.commandCard.widthCells, data.commandCard.heightCells);
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

                $('.army').righteousToggle(data.state.army);
                if (data.state.army)
                {
                    updateArmy(data.state.army);
                }

                $('.sellout').righteousToggle(data.sellout);

                if (data.events)
                {
                    data.events.map(event => renderPersonalEvent(event));
                }
            }
            else
            {
                // reinitialize all the text boxes
                $('.feeding').righteousToggle(false);
                $('.resource .value').text('0').prop('Counter', '0');
                $('.income .value').text('+0').prop('Counter', '0').taxColor(0);
                $('#extension-hint').righteousToggle(data.globalMessage && data.globalMessage.endsWith('elcome'));
                $('.stance, .focus').html('');
                isGameDataApplied = false;
            }

            $('.message').text(data.globalMessage);

			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
}

function updateArmy(army) {
    var unitsPresent = Object.keys(army);
    var thisIter = Math.random() + '';
    for (var i = 0; i < unitsPresent.length; i++) {
        var unit = unitsPresent[i];
        var count = army[unit];

        var unitDiv = $('#unitcount-' + unit);
        if (unitDiv.length == 0) {
            unitDiv = $('<div/>').addClass('unit');
            unitDiv.attr('id', 'unitcount-' + unit).attr('unitId', unit).attr('title', UNITS[unit]);
            unitDiv.css('background-position', UNIT_TABLE_OFFSET(unit));
            var countEl = $('<span/>').addClass('count');
            unitDiv.append(countEl);
            $('.army').append(unitDiv);
        }
        unitDiv.attr('iter', thisIter);
        unitDiv.find('.count').text(count);
    }

    // units not received on this iteration get purged
    $(".unit[iter!='" + thisIter + "']").each(function() {
        $(this).detach();
    });
}

function setStanceText(stanceString) {
    let stanceElement = $('.stance').html('');
    if (stanceString) {
        $('<span/>').addClass('label').text('stance: ').appendTo(stanceElement);
        stanceElement.append(stanceString).tooltip('Army behavior');;
    }
}

function setFocusText(focusString) {
    let focusElement = $('.focus').html('');
    if (focusString) {
        $('<span/>').addClass('label').text('focus: ').appendTo(focusElement);
        focusElement.append(focusString).tooltip('Attack priority');
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

        var myX = Math.floor(posX * scaleWidth / $(this).width());
        var myY = Math.floor(scaleHeight - posY * scaleHeight / $(this).height());
        return {x: myX, y: myY};
    },
	trackClicks: function(valueHolder, valueDisplayFn, valueClipFn, scaleWidth, scaleHeight) {
	    function myClickTrack(event) {
	        if (event.which == 1) {
                var crds = $(this).mouseCoords(event, scaleWidth, scaleHeight);
                valueClipFn(crds);
            }
	    }

	    $(this).mouseout(function(event) {
	        valueHolder.text('');
	    }).mousemove(function(event) {
	        var crds = $(this).mouseCoords(event, scaleWidth, scaleHeight);
	        var str = valueDisplayFn(crds);
	        valueHolder.text(str);
	    }).unbind('click').bind('click', myClickTrack);
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
    },
    tooltip: function(txt) {
        $(this).addClass('tooltip').append('<span class="tooltiptext">' + txt + '</span>');
    }
});

let $clipboard = $("<input id='clipboard'>").appendTo('body').righteousToggle(false);
let CLIPBOARD_COMBO_TOKENS = {
    BUILD: { attr: 'b', combo: ['b', 'c', 'm']},
    COORDS: { attr: 'c', combo: ['b', 'c', 'm']},
    MULTIPLIER: { attr: 'm' },
    OTHER: { attr: 'o'},
    _clearAllAttributes: function() {
        Object.values(CLIPBOARD_COMBO_TOKENS).map(val => val.attr ? $clipboard.attr(val.attr, '') : null);
    }
};

function copyToClipboard(text, key) {
    var oldValue = $clipboard.attr(key.attr);
    $clipboard.attr(key.attr, text);

    var newVal;
    if (key.combo) {
        if (key.combo.includes("m") && oldValue == text) {
            var multiplierText = $clipboard.attr(CLIPBOARD_COMBO_TOKENS.MULTIPLIER.attr);
            var multiplier = multiplierText ? parseInt(multiplierText) : 1;
            $clipboard.attr(CLIPBOARD_COMBO_TOKENS.MULTIPLIER.attr, multiplier + 1);
        }
        newVal = key.combo.map(a => $clipboard.attr(a)).join(" ").replace(/\s+/g, ' ');
    } else {
        newVal = text;
    }

    if (key.timeoutHandle) clearTimeout(key.timeoutHandle);
    key.timeoutHandle = setTimeout(function () {
        $clipboard.attr(key.attr, null);
        $clipboard.attr(CLIPBOARD_COMBO_TOKENS.MULTIPLIER.attr, null);
    }, 3000); // keep last timeout handle for each type of token

    $clipboard.righteousToggle(true).val(newVal.trim()).select();
    document.execCommand("copy");
    $clipboard.righteousToggle(false);
}

$(function () {
    toggleMode(false);
	pollResourcesPeriodically(true);
	startUpdatingInGameEventsLog();
	$('.minimap').trackClicks($('.minimap-click-data'), crds => ((crds.x + 1) + " " + crds.y),
	    crds => copyToClipboard("(" + (crds.x + 1) + " " + crds.y + ")", CLIPBOARD_COMBO_TOKENS.COORDS), 100, 100);
	$("#extension-hint .close").click(() => $("#extension-hint").detach());
    initTips();
});

function initTips()
{
    $('.minerals').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minerals');
    $('.gas').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vespene');
    $('.supply').tooltip('Supply: your/total/limit');
    $('.minerals-income').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;minerals income');
    $('.gas-income').tooltip('Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vespene income');
    $('.supply').tooltip('Supply: your/total/limit');
    $('.workers-minerals').tooltip('Workers on minerals');
    $('.workers-gas').tooltip('Workers on vespene');
    $('.workers-moving').tooltip('Moving workers');
    $('.workers-idle').tooltip('Idle<br/>workers');
}


//----------------------------------
//-------AUTH-----------------------
//----------------------------------
twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
});