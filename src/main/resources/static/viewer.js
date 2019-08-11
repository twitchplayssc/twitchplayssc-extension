let OVERLAY_API_BASE_URL = 'https://piscine-monsieur-91924.herokuapp.com/api';
let RESOURCE_POLL_TIMEOUT = 2000;
let token = '';
let tuid = '';

const twitch = window.Twitch.ext;
console.log(twitch);

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
			if (data.inGame) {

				$('.gas .value').numberChange(data.inGame.gas);
				$('.minerals .value').numberChange(data.inGame.minerals);
                $('.supply .value').text(data.inGame.supply);

                $('.feeding').righteousToggle(data.inGame.feeding);
                $('.resource.income').righteousToggle(!data.inGame.feeding);

                $('.feeding .value').text(data.inGame.feeding);
                $('.gas-income .value').numberChange(data.inGame.gasIncome, '+')
                    .taxColor(data.inGame.gasTax);
                $('.minerals-income .value').numberChange(data.inGame.mineralsIncome, '+')
                    .taxColor(data.inGame.mineralsTax);
            }
            else
            {
                $('.feeding').righteousToggle(false);
                $('.resource .value').text('0').prop('Counter', '0');
            }

            $('.message').text(data.globalMessage);

			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
}

function toggleMode(joined){
	$('.resource').righteousToggle(joined);
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
	numberChange: function(newNumber, str) {
        $(this).prop('Counter', $(this).text()).animate({ Counter: newNumber }, {
            duration: 800,
            easing: 'swing',
            step: function (now) {
                $(this).text((str ? str : '') + Math.ceil(now));
            }
        });
        return this;
    },
	rgbColor: function(r, g, b) {
		$(this).css("color", "rgb(" + r + "," + g + "," + b + ")");
		return this;
	},
	taxColor: function(tax) {
	    if (!tax)
	    {
	        return this;
	    }
	    var r = 255;
        var g = 255 - Math.max(5 * tax - 245, 0);
        var b = 255 - Math.min(5 * tax, 255);
        console.log(r + ' ' + g + ' ' + b)
        $(this).rgbColor(r, g, b);
        return this;
	}
});

$(function () {
    toggleMode(true);
	pollResourcesPeriodically();
});

function logg(whatever)
{
	console.log(whatever);
	twitch.rig.log(whatever);
}

//----------------------------------
//-------ZOOM-----------------------
//----------------------------------
/*
let videoResolution = 1920;
let zoom = 1.0;
function resize(newWidth)
{
	if (videoResolution != newWidth)
    {
        zoom = newResolution * 1.0 / 1920;
        logg("new resolution: " +newWidth);
        logg("new zoom: " +zoom);
        $('body').css('zoom', zoom);
        videoResolution = newWidth;
    }
}

twitch.onContext(function (context) {
    logg(context);
    var indexOfX = context.displayResolution.indexOf('x');
    var newResolution = parseInt(context.displayResolution.substring(0, indexOfX));

    if (videoResolution != newResolution)
    {
        zoom = newResolution * 1.0 / 1920;
        logg("new resolution: " +newResolution);
        logg("new zoom: " +zoom);
        $('body').css('zoom', zoom);
        videoResolution = newResolution;
    }
});*/

//----------------------------------
//-------AUTH-----------------------
//----------------------------------
twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  
  tuid = auth.userId;
  
  console.log(auth)
});