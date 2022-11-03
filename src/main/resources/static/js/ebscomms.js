let OVERLAY_API_BASE_URL = 'https://piscine-monsieur-91924.herokuapp.com/api/client';
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