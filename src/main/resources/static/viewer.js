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

let state = {};
function pollResourcesPeriodically()
{
	if(!token) { 
		setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		return;
	}
	
	ebsReq({
		url: OVERLAY_API_BASE_URL + '/resources?uid=' + tuid.substring(1),
		type: 'GET',
		success: function(data) {
			toggleMode(data.resources);

			if (data.resources) {
				if (state.gas != data.resources.gas)
				{
					$('.gas').html(data.resources.gas);
				}
				if (state.minerals != data.resources.minerals)
                {
                    $('.minerals').html(data.resources.minerals);
                }
            	if (state.feeding != data.resources.feeding)
                {
                    if (data.resources.feeding)
                    {
                        $('.feeding .value').text(data.resources.feeding);
                    }
                }
            	state = data.resources;
            }
			setTimeout(pollResourcesPeriodically, RESOURCE_POLL_TIMEOUT);
		}
	});
	
}

function toggleMode(joined){
	$('.feeding').righteousToggle(joined);
	$('.resource').righteousToggle(joined);
	$('.typetoplay').righteousToggle(!joined);
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
//	toggleMode(true);
	//$('.feeding').toggle(true);
//	$('body').css('background-image', 'url("img/bg.png")');
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

let videoResolution = 1920;
let zoom = 1.0;
twitch.onContext(function (context) {
    logg(context);
    var indexOfX = context.displayResolution.indexOf('x');
    var newResolution = parseInt(context.displayResolution.substring(0, indexOfX));

    if (videoResolution != newResolution)
    {
        zoom = newResolution * 1.0 / 1920;
        logg("new resolution: " +newResolution);
        logg("new zoom: " +zoom);
        $('document').css('zoom', zoom);
        videoResolution = newResolution;
    }
});

//----------------------------------
//-------AUTH-----------------------
//----------------------------------
twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  
  tuid = auth.userId;
  
  console.log(auth)
});