package org.camokatuk.extensionserver.twitchapi;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

	private final RestTemplate restTemplate = new RestTemplate();
	private final String extensionClientId;

	private final Map<Integer, String> userNameToIdCache = new HashMap<>();

	@Autowired
	public TwitchApi(@Value("${extension.client_id}") String extensionClientId)
	{
		this.extensionClientId = extensionClientId;
	}

	public String getUserDisplayName(int uid)
	{
		String cachedUserName = userNameToIdCache.get(uid);
		if (cachedUserName != null)
		{
			return cachedUserName;
		}

		try
		{
			HttpHeaders headers = new HttpHeaders();
			headers.set("Client-ID", extensionClientId);
			UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.twitch.tv/helix/users").queryParam("id", uid);
			HttpEntity<String> entity = new HttpEntity<>("", headers);
			ResponseEntity<UserData> response = restTemplate.exchange(builder.toUriString(), HttpMethod.GET, entity, UserData.class);
			String userName = response.getBody().data[0].login.toLowerCase(); // not checking for NPEs YOLO

			userNameToIdCache.put(uid, userName);
			return userName;
		}
		catch (Exception e)
		{
			LOG.warn("Failed to fetch userName by user id: " + uid, e);
			return null;
		}
	}
}
