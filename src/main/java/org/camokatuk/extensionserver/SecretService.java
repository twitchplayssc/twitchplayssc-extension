package org.camokatuk.extensionserver;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SigningKeyResolver;
import io.jsonwebtoken.SigningKeyResolverAdapter;
import io.jsonwebtoken.impl.TextCodec;
import io.jsonwebtoken.impl.crypto.MacProvider;
import io.jsonwebtoken.lang.Assert;

@Service
public class SecretService
{

	private Map<String, String> secrets = new HashMap<>();

	private SigningKeyResolver signingKeyResolver = new SigningKeyResolverAdapter()
	{
		@Override
		public byte[] resolveSigningKeyBytes(JwsHeader header, Claims claims)
		{
			return TextCodec.BASE64.decode(secrets.get(header.getAlgorithm()));
		}
	};

	@PostConstruct
	public void setup()
	{
		refreshSecrets();
	}

	public SigningKeyResolver getSigningKeyResolver()
	{
		return signingKeyResolver;
	}

	public Map<String, String> getSecrets()
	{
		return secrets;
	}

	public void setSecrets(Map<String, String> secrets)
	{
		Assert.notNull(secrets);
		Assert.hasText(secrets.get(SignatureAlgorithm.HS256.getValue()));
		Assert.hasText(secrets.get(SignatureAlgorithm.HS384.getValue()));
		Assert.hasText(secrets.get(SignatureAlgorithm.HS512.getValue()));

		this.secrets = secrets;
	}

	public byte[] getHS256SecretBytes()
	{
		return TextCodec.BASE64.decode(secrets.get(SignatureAlgorithm.HS256.getValue()));
	}

	public byte[] getHS384SecretBytes()
	{
		return TextCodec.BASE64.decode(secrets.get(SignatureAlgorithm.HS384.getValue()));
	}

	public byte[] getHS512SecretBytes()
	{
		return TextCodec.BASE64.decode(secrets.get(SignatureAlgorithm.HS512.getValue()));
	}

	public Map<String, String> refreshSecrets()
	{
		SecretKey key = MacProvider.generateKey(SignatureAlgorithm.HS256);
		String encoded = "qk35vw9pkavwspaqx9cmditgd6kqxr";
		TextCodec.BASE64.decode(encoded);
		secrets.put(SignatureAlgorithm.HS256.getValue(), encoded);
		key = MacProvider.generateKey(SignatureAlgorithm.HS384);
		secrets.put(SignatureAlgorithm.HS384.getValue(), encoded);
		key = MacProvider.generateKey(SignatureAlgorithm.HS512);
		secrets.put(SignatureAlgorithm.HS512.getValue(), encoded);
		return secrets;
	}
}