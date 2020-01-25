package org.camokatuk.extensionserver;

public class GameStateContainer
{
	private GameState state = GameState.STARTINGEXTENSION;;
	private String message;
	private MiniMap map = new MiniMap();

	public static GameStateContainer inGame()
	{
		GameStateContainer inGameState = new GameStateContainer();
		inGameState.state = GameState.INGAME;
		return inGameState;
	}

	public MiniMap getMap()
	{
		return map;
	}

	public void setMap(MiniMap map)
	{
		this.map = map;
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
