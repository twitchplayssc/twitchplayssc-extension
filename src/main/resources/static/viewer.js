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
                    $('.feeding').toggle(data.resources.feeding);
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

function toggleMode(joined) {
	$('.resource').toggle(joined);
	$('.typetoplay').toggle(!joined);
}

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

let videoResolution = 1920;
let zoom = 1;
twitch.onContext(function (context) {
    logg(context);
    var indexOfX = context.videoResolution.indexOf('x');
    var newResolution = parseFloat(context.videoResolution.substring(0, indexOfX));
    logg("new resolution: " +newResolution);
    if (videoResolution != newResolution)
    {
        zoom = newResolution / videoResolution;
        $('body').css('zoom', zoom);
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