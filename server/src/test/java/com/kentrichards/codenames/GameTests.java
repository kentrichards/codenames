package com.kentrichards.codenames;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class GameTests {
    ArrayList<Card> deck = CardUtil.getCards();
    ArrayList<Player> players = generatePlayers();
    Game g = new Game("hark", deck, players);

    @Test
    public void onCardClick_BluePlayerBlueCard_NoWin() {
        assertEquals(g.getTurn(), Team.BLUE);

        Card c = getCard(CardType.BLUE);

        g.onCardClick(getPlayer(Team.BLUE), c);

        assertTrue(c.isRevealed());
        assertEquals(g.getTurn(), Team.BLUE);
    }

    @Test
    public void onCardClick_BluePlayerRedCard_NoWin() {
        assertEquals(g.getTurn(), Team.BLUE);

        Card c = getCard(CardType.RED);

        g.onCardClick(getPlayer(Team.BLUE), c);

        assertTrue(c.isRevealed());
        assertEquals(g.getTurn(), Team.RED);
    }

    @Test
    public void onCardClick_BluePlayerBlueCard_Win() {
        Game smallGame = new Game("hark2", new ArrayList<>(Collections.singletonList(getCard(CardType.BLUE))) {
        }, players);
        Card c = smallGame.getDeck().get(0);
        assertEquals(smallGame.getTurn(), Team.BLUE);
        assertFalse(c.isRevealed());

        smallGame.onCardClick(getPlayer(Team.BLUE), c);
        assertTrue(c.isRevealed());
        assertTrue(smallGame.isOver());
    }

    @Test
    public void deathCard() {
        Game smallGame = new Game("hey", new ArrayList<>(Collections.singletonList(getCard(CardType.DEATH))) {
        }, players);
        smallGame.onCardClick(players.get(0), deck.get(0));
        assertTrue(smallGame.isOver());
    }

    private ArrayList<Player> generatePlayers() {
        int NUM_PLAYERS = 4;
        ArrayList<Player> players = new ArrayList<>(NUM_PLAYERS);
        players.add(new Player(Team.BLUE, Role.OPERATIVE));
        players.add(new Player(Team.BLUE, Role.SPYMASTER));
        players.add(new Player(Team.RED, Role.OPERATIVE));
        players.add(new Player(Team.RED, Role.SPYMASTER));

        return players;
    }

    private Player getPlayer(Team t) {
        for (Player player : players) {
            if (player.team() == t) return player;
        }

        return null;
    }

    private Card getCard(CardType ct) {
        for (Card c : deck) {
            if (c.getType() == ct) return c;
        }

        return null;
    }
}
