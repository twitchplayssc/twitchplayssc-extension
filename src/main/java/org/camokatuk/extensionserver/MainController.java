package org.camokatuk.extensionserver;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MainController
{
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

}
