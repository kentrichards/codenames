package com.kentrichards.codenames;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

public class CardUtil {
    public static final int DECK_SIZE = 25;

    private static final ArrayList<String> wordList = new ArrayList<>(Arrays.asList("Atlantis", "Microscope", "Argyle", "Edward", "Horseshoe", "Ambulance", "Spell", "Soap", "Cook", "Hospital", "Cliff", "Jupiter", "Drop", "Dice", "Ham", "Bored", "Boot", "Casino", "Hawk", "Rabbit", "Phoenix", "Shark", "Mars", "Plane", "Emperor", "Buck", "Straw", "Press", "Pilot", "Van"));

    public static ArrayList<Card> getCards() {
        ArrayList<String> words = shuffle(wordList);
        ArrayList<Card> cards = addCardTypes(words);
        return shuffle(cards);
    }

    public static int redCardsRemaining(ArrayList<Card> deck) {
        return (int) deck.stream().filter(c -> c.getType() == CardType.RED).filter(c -> !c.isRevealed()).count();
    }

    public static int blueCardsRemaining(ArrayList<Card> deck) {
        return (int) deck.stream().filter(c -> c.getType() == CardType.BLUE).filter(c -> !c.isRevealed()).count();
    }

    private static <T> ArrayList<T> shuffle(ArrayList<T> a) {
        Collections.shuffle(a);
        return a;
    }

    private static ArrayList<Card> addCardTypes(ArrayList<String> words) {
        ArrayList<Card> cards = new ArrayList<>();
        for (int i = 0; i <= 8; i++) {
            cards.add(new Card(words.get(i), CardType.BLUE));
        }

        for (int i = 9; i <= 17; i++) {
            cards.add(new Card(words.get(i), CardType.RED));
        }

        for (int i = 18; i <= 24; i++) {
            cards.add(new Card(words.get(i), CardType.NEUTRAL));
        }

        cards.add(new Card(words.get(DECK_SIZE - 1), CardType.DEATH));
        return cards;
    }
}
