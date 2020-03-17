package org.camokatuk.extensionserver;

import java.util.List;

public class UserGameState
{
	private int gas;
	private int minerals;
	private int terrazine;
	private int gasIncome;
	private int mineralsIncome;
	private int gasTax;
	private int mineralsTax;
	private String stance;
	private String focus;
	private String supply;
	private String feeding;
	private Workers workers;

	public String getFocus()
	{
		return focus;
	}

	public void setFocus(String focus)
	{
		this.focus = focus;
	}

	public String getStance()
	{
		return stance;
	}

	public void setStance(String stance)
	{
		this.stance = stance;
	}

	public int getTerrazine()
	{
		return terrazine;
	}

	public void setTerrazine(int terrazine)
	{
		this.terrazine = terrazine;
	}

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
