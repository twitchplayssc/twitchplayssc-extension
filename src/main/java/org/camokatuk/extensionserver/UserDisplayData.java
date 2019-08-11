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
		private int gasIncome;
		private int mineralsIncome;
		private int gasTax;
		private int mineralsTax;
		private String supply;
		private String feeding;
		private Workers workers;

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

		public int getGasIncome()
		{
			return gasIncome;
		}

		public void setGasIncome(int gasIncome)
		{
			this.gasIncome = gasIncome;
		}

		public int getMineralsIncome()
		{
			return mineralsIncome;
		}

		public void setMineralsIncome(int mineralsIncome)
		{
			this.mineralsIncome = mineralsIncome;
		}

		public int getGasTax() {
			return gasTax;
		}

		public void setGasTax(int gasTax) {
			this.gasTax = gasTax;
		}

		public int getMineralsTax() {
			return mineralsTax;
		}

		public void setMineralsTax(int mineralsTax) {
			this.mineralsTax = mineralsTax;
		}

		public String getSupply()
		{
			return supply;
		}

		public void setSupply(String supply)
		{
			this.supply = supply;
		}

		public Workers getWorkers() {
			return workers;
		}

		public void setWorkers(Workers workers) {
			this.workers = workers;
		}

		public static class Workers
		{
			private int minerals;
			private int gas;
			private int idle;
			private int moving;

			public int getMinerals() {
				return minerals;
			}

			public void setMinerals(int minerals) {
				this.minerals = minerals;
			}

			public int getGas() {
				return gas;
			}

			public void setGas(int gas) {
				this.gas = gas;
			}

			public int getIdle() {
				return idle;
			}

			public void setIdle(int idle) {
				this.idle = idle;
			}

			public int getMoving() {
				return moving;
			}

			public void setMoving(int moving) {
				this.moving = moving;
			}
		}
	}

	public static class LeaderboardData
	{
		/* TODO */
	}
}
