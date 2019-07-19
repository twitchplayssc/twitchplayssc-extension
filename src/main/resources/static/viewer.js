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
				if (ingameState.gas != data.inGame.gas)
				{
					$('.gas').html(data.inGame.gas);
				}
				if (ingameState.minerals != data.inGame.minerals)
                {
                    $('.minerals').html(data.inGame.minerals);
                }
            	if (ingameState.feeding != data.inGame.feeding)
                {
                    $('.feeding').righteousToggle(data.inGame.feeding);
                    if (data.inGame.feeding)
                    {
                        $('.feeding .value').text(data.inGame.feeding);
                    }
                }
            	ingameState = data.inGame;
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
	}
});

$(function () {
	toggleMode(true); $('body').css('background-image', 'url(img/bg.png)'); $('.feeding').show();

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