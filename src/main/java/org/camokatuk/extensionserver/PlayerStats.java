package org.camokatuk.extensionserver;

public class PlayerStats
{
	private Resources resources;

	public Resources getResources()
	{
		return resources;
	}

	public void setResources(Resources resources)
	{
		this.resources = resources;
	}

	public static class Resources
	{
		private int gas;
		private int minerals;

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
	}

}
