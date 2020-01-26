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

			$('.resource').righteousToggle(data.inGame);
			$('.minimap-click-data, .minimap, .command-card-click-data, .command-card').righteousToggle(data.inGame);
			if (data.inGame) {
			    if (data.inGame.map) {
			        $('.minimap').scaleToRatio(data.inGame.map.ratio ? data.inGame.map.ratio : 1);
			    }

                let stanceElement = $('.stance').removeClass().addClass('stance');
			    if (data.inGame.stance === 0) stanceElement.addClass('manual');
			    if (data.inGame.stance === 1) stanceElement.addClass('offensive');
			    if (data.inGame.stance === 2) stanceElement.addClass('offensive');

				$('.gas .value').numberChange(data.inGame.gas);
				$('.minerals .value').numberChange(data.inGame.minerals);
                $('.supply .value').text(data.inGame.supply);
                $('.terrazine .value').text(data.inGame.terrazine);

                $('.feeding').righteousToggle(data.inGame.feeding);
                $('.resource.income').righteousToggle(!data.inGame.feeding);

                $('.feeding .value').text(data.inGame.feeding);
                $('.gas-income .value').numberChange(data.inGame.gasIncome, '+')
                    .taxColor(data.inGame.gasTax);
                $('.minerals-income .value').numberChange(data.inGame.mineralsIncome, '+')
                    .taxColor(data.inGame.mineralsTax);

                if (data.inGame.workers)
                {
                    $('.workers-minerals .value').numberChange(data.inGame.workers.minerals);
                    $('.workers-gas .value').numberChange(data.inGame.workers.gas);
                    $('.workers-moving .value').numberChange(data.inGame.workers.moving);
                    $('.workers-idle .value').numberChange(data.inGame.workers.idle, '', function(e, val) {
                        e.toggleClass("value-warn", val > 0);
                    });
                }

                $('.sellout').righteousToggle(data.inGame.sellout);
            }
            else
            {
                // reinitialize all the text boxes
                $('.feeding').righteousToggle(false);
                $('.resource .value').text('0').prop('Counter', '0');
                $('.income .value').text('+0').prop('Counter', '0').taxColor(0);
            }

            $('.message').text(data.globalMessage);

			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
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
	numberChange: function(newNumber, str, onstep) {
        $(this).prop('Counter', $(this).text()).animate({ Counter: newNumber }, {
            duration: 800,
            easing: 'swing',
            step: function (now) {
                $(this).text((str ? str : '') + Math.ceil(now));
                if (onstep) onstep($(this), Math.ceil(now));
            }
        });
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
            	copyToClipboard(valueClipFn(crds));
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

function copyToClipboard(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

$(function () {
    toggleMode(false);
	pollResourcesPeriodically();
	$('.minimap').trackClicks($('.minimap-click-data'), crds => (crds.x + " " + crds.y),
	    crds => "(" + crds.x + " " + crds.y + ")", 100, 100);
	$('.command-card').trackClicks($('.command-card-click-data'), crds => command(crds).sh,
	    crds => command(crds).lg, 7, 4);
});


function command(crds) {
    if (crds.x == 1 && crds.y == 0) return {sh: '!u s', lg: '!upgrade shields'};
    if (crds.x == 1 && crds.y == 1) return {sh: '!u ga', lg: '!upgrade ground_armor'};
    if (crds.x == 1 && crds.y == 2) return {sh: '!u gw', lg: '!upgrade ground_weapons'};

    if (crds.x == 2 && crds.y == 0) return {sh: '!r wg', lg: '!research warpgate'};
    if (crds.x == 2 && crds.y == 1) return {sh: '!u aa', lg: '!upgrade air_armor'};
    if (crds.x == 2 && crds.y == 2) return {sh: '!u aw', lg: '!upgrade air_weapons'};

    if (crds.x == 3 && crds.y == 0) return {sh: '!r g', lg: '!research glaive'};
    if (crds.x == 3 && crds.y == 1) return {sh: '!r b', lg: '!research blink'};
    if (crds.x == 3 && crds.y == 2) return {sh: '!r c', lg: '!research charge'};

    if (crds.x == 4 && crds.y == 0) return {sh: '!r tl', lg: '!research thermal_lance'};
    if (crds.x == 4 && crds.y == 1) return {sh: '!r gd', lg: '!research drive'};
    if (crds.x == 4 && crds.y == 2) return {sh: '!r gb', lg: '!research boosters'};

    if (crds.x == 5 && crds.y == 1) return {sh: '!r fv', lg: '!research fluxvanes'};
    if (crds.x == 5 && crds.y == 2) return {sh: '!r pc', lg: '!research crystals'};

    if (crds.x == 6 && crds.y == 2) return {sh: '!r s', lg: '!research storm'};

    if (crds.x == 7 && crds.y == 2) return {sh: '!r ss', lg: '!research dark_templar'};


    if (crds.x == 1 && crds.y == 3) return {sh: '!b f', lg: '!build forge'};
    if (crds.x == 2 && crds.y == 3) return {sh: '!b cc', lg: '!build core'};
    if (crds.x == 3 && crds.y == 3) return {sh: '!b t', lg: '!build twilight'};
    if (crds.x == 4 && crds.y == 3) return {sh: '!b rb', lg: '!build robo_bay'};
    if (crds.x == 5 && crds.y == 3) return {sh: '!b fb', lg: '!build fleet_beacon'};
    if (crds.x == 6 && crds.y == 3) return {sh: '!b ta', lg: '!build templar_archives'};
    if (crds.x == 7 && crds.y == 3) return {sh: '!b ds', lg: '!build dark_shrine'};

    if (crds.x == 5 && crds.y == 0) return {sh: '!b g', lg: '!build gateway'};
    if (crds.x == 6 && crds.y == 0) return {sh: '!b r', lg: '!build robo'};
    if (crds.x == 7 && crds.y == 0) return {sh: '!b s', lg: '!build stargate'};

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