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

let ingameState = {};
function pollResourcesPeriodically()
{
	if(!token) { 
		setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		return;
	}
	
	ebsReq({
		url: OVERLAY_API_BASE_URL + '/display',
		type: 'GET',
		success: function(data) {
			toggleMode(data.inGame);

			if (data.inGame) {
				$('.gas .value').numberChange(data.inGame.gas);
				$('.minerals .value').numberChange(data.inGame.minerals);
                $('.supply .value').text(data.inGame.supply);

                $('.feeding').righteousToggle(data.inGame.feeding);
                $('.resource.income').righteousToggle(!data.inGame.feeding);

                $('.feeding .value').text(data.inGame.feeding);
                $('.gas-income .value').numberChange(data.inGame.gasIncome, '+');
                $('.minerals-income .value').numberChange(data.inGame.mineralsIncome, '+');
            }
            else if (data.globalMessage) {
                $('.message').text(data.globalMessage).righteousToggle(true);
            }
			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
	
}

function toggleMode(joined){
	$('.resource').righteousToggle(joined);
	$('.message').righteousToggle(!joined);
}

$.fn.extend({ // avoids triggering show animation when not necessary
	righteousToggle: function(show) {
		if ($(this).is(':visible') && !show) {
			$(this).hide();
		} else if ($(this).is(':hidden') && show) {
			$(this).show();
		}
		return this;
	}
});

$.fn.extend({ // avoids triggering show animation when not necessary
	numberChange: function(newNumber, str) {
		$(this).prop('Counter', $(this).text()).animate({ Counter: newNumber }, {
            duration: 800,
            easing: 'swing',
            step: function (now) {
              $(this).text((str ? str : '') + Math.ceil(now));
            }
        });
        return this;
	}
});


$(function () {
//	toggleMode(true); $('body').css('background-image', 'url(img/bg.png)'); // $('.feeding').show(); $('.income').hide();
//	$('.minerals .value').numberChange(99999); $('.gas .value').numberChange(99999); $('.minerals-income .value').numberChange(9999, '+'); $('.gas-income .value').numberChange(9999, '+');;


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