package org.camokatuk.extensionserver.twitchapi;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class TwitchApi
{
	private static final Log LOG = LogFactory.getLog(TwitchApi.class);

	private static final String CLIENT_ID = "wj2tk1o40kcqsekdv2iknadal1krac";
	private static final String CLIENT_SECRET = "ml9u3bcjdxqbdtap5pbyl87j5h5jf7";

	private final RestTemplate restTemplate = new RestTemplate();

	public String getUserDisplayName(int uid)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.set("Client-ID", CLIENT_ID);
		UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.twitch.tv/helix/users").queryParam("id", uid);
		HttpEntity<String> entity = new HttpEntity<>("", headers);
		ResponseEntity<UserData> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity, UserData.class);
		return response.getBody().data[0].display_name;
	}

	public static void main(String[] asd)
	{
		System.out.println(new TwitchApi().getUserDisplayName(77080650));
	}
}
