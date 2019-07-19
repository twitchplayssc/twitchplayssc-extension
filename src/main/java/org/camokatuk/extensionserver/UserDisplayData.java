package org.camokatuk.extensionserver;

public class UserDisplayData
{
	private InGame inGame;
	private LeaderboardData leaderboard;
	private String globalMessage;

	public static UserDisplayData msg(String msg)
	{
		UserDisplayData instance = new UserDisplayData();
		instance.setGlobalMessage(msg);
		return instance;
	}

	public String getGlobalMessage()
	{
		return globalMessage;
	}

	public void setGlobalMessage(String globalMessage)
	{
		this.globalMessage = globalMessage;
	}

	public InGame getInGame()
	{
		return inGame;
	}

	public void setInGame(InGame inGame)
	{
		this.inGame = inGame;
	}

	public static class InGame
	{
		private int gas;
		private int minerals;
		private String feeding;

		public int getGas()
		{
			return gas;
		}

		public void setGas(int gas)
		{
			this.gas = gas;
		}

		public int getMinerals()
		{
			return minerals;
		}

		public void setMinerals(int minerals)
		{
			this.minerals = minerals;
		}

		public String getFeeding()
		{
			return feeding;
		}

		public void setFeeding(String feeding)
		{
			this.feeding = feeding;
		}
	}

	public static class LeaderboardData
	{
		/* TODO */
	}
}
