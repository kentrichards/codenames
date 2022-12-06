package com.kentrichards.codenames;

public class Card {
    private final String word;
    private final CardType type;
    private boolean isRevealed;

    public Card(String word, CardType type) {
        this.word = word;
        this.type = type;
        isRevealed = false;
    }

    public String getWord() {
        return word;
    }

    public CardType getType() {
        return type;
    }

    public boolean isRevealed() {
        return isRevealed;
    }

    public void reveal() {
        isRevealed = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Card card = (Card) o;

        if (!word.equals(card.word)) return false;
        return type == card.type;
    }

    @Override
    public int hashCode() {
        int result = word.hashCode();
        result = 31 * result + type.hashCode();
        return result;
    }
}
