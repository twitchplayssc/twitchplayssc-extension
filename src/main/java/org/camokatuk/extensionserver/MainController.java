package org.camokatuk.extensionserver;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MainController
{
	@CrossOrigin(origins = "*")
	@RequestMapping("/resources")
	public String index(@RequestParam("uid") String userId)
	{
		System.out.println("Request from " + userId);
		if (userId.equals("77080650"))
		{
			return "CORRECT USER!";
		}
		else
		{
			return "FAILED " + userId;
		}
	}

	@CrossOrigin(origins = "*")
	@RequestMapping("/auth")
	public String acceptJwt(@RequestParam("uid") String userId, @RequestHeader("x-extension-jwt") String jwt)
	{
		System.out.println("JWT: " + jwt);
		return jwt;
	}

}
/*// create the request options for our Twitch API calls
const requests = {
  checkuserid: userlookup()
};

function userlookup () {
  return {
    type: 'GET',
    url:'https://api.twitch.tv/helix/users?display_name=ahorseinahospital',
    success: logSuccess,
    error: logError,
	headers: { 'Client-ID': 'wj2tk1o40kcqsekdv2iknadal1krac' }
  };
}

function setAuth (token) {
  Object.keys(requests).forEach((req) => {
    twitch.rig.log('Setting auth headers');
    requests[req].headers = { 'Authorization': 'Bearer ' + token };
  });
}

*/