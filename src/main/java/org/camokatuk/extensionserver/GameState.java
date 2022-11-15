package org.camokatuk.extensionserver;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.node.TextNode;

import java.io.IOException;
import java.util.stream.Stream;

@JsonDeserialize(using = GameState.GameStateDeserializer.class)
public enum GameState {
    INGAME(true),
    INGAME_SELLOUT(true),
    LEADERBOARDS(),
    BROKEN(),
    STARTINGEXTENSION(),
    STARTINGSTREAM();

    private boolean inGame;

    GameState(boolean inGame) {
        this.inGame = inGame;
    }

    GameState() {
        this(false);
    }

    @JsonValue
    public String jsonRepresentation() {
        return this.name().toLowerCase();
    }

    public static boolean isInGame(GameState state) {
        return state != null && state.inGame;
    }

    public boolean isInGame() {
        return inGame;
    }

    public static boolean isNotInGame(GameState state) {
        return !isInGame(state);
    }

    public static class GameStateDeserializer extends JsonDeserializer<GameState> {
        @Override
        public GameState deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException {
            ObjectCodec oc = jsonParser.getCodec();
            TextNode node = oc.readTree(jsonParser);
            return Stream.of(GameState.values()).filter(s -> s.name().equals(node.asText().toUpperCase())).findAny().orElse(GameState.BROKEN);
        }
    }
}
