package com.kentrichards.codenames;

import java.util.ArrayList;

public class Game {
    public final String id;
    private final ArrayList<Card> deck;
    private final ArrayList<Player> players;
    private Team turn;
    private boolean isOver;

    public Game(String id, ArrayList<Card> deck, ArrayList<Player> players) {
        this.id = id;
        this.deck = deck;
        this.players = players;
        turn = Team.BLUE;
        isOver = false;
    }

    public boolean isOver() {
        return isOver;
    }

    public ArrayList<Card> getDeck() {
        return deck;
    }

    public ArrayList<Player> getPlayers() {
        return players;
    }

    public Team getTurn() {
        return turn;
    }

    public void onCardClick(Player p, Card c) {
        if (p.team() != turn) return;

        c.reveal();

        switch (c.getType()) {
            case DEATH -> death();
            case NEUTRAL -> switchTurn();
            case RED -> handleRedCard(p);
            case BLUE -> handleBlueCard(p);
        }
    }

    private void death() {
        switchTurn();
        gameOver(turn);
    }

    private void gameOver(Team t) {
        isOver = true;
        System.out.println(t.toString() + " TEAM WON!");
    }

    private void switchTurn() {
        if (turn == Team.BLUE) turn = Team.RED;
        else turn = Team.BLUE;
    }

    private void handleRedCard(Player p) {
        if (CardUtil.redCardsRemaining(deck) == 0) gameOver(Team.RED);
        else if (p.team() == Team.BLUE) switchTurn();
    }

    private void handleBlueCard(Player p) {
        if (CardUtil.blueCardsRemaining(deck) == 0) gameOver(Team.BLUE);
        else if (p.team() == Team.RED) switchTurn();
    }
}
