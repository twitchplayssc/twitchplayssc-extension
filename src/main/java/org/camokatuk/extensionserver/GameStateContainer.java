package org.camokatuk.extensionserver;

public class GameStateContainer
{
	private GameState state;
	private String message;

	public GameStateContainer()
	{
		this.state = GameState.STARTINGEXTENSION;
	}

	public static GameStateContainer inGame()
	{
		GameStateContainer inGameState = new GameStateContainer();
		inGameState.state = GameState.INGAME;
		return inGameState;
	}

	public GameState getState()
	{
		return state;
	}

	public void setState(GameState state)
	{
		this.state = state;
	}

	public String getMessage()
	{
		return message;
	}

	public void setMessage(String message)
	{
		this.message = message;
	}
}
