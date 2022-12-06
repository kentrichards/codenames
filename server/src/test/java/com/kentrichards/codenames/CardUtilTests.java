package com.kentrichards.codenames;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;

public class CardUtilTests {
    @Test
    public void testGetCards() {
        ArrayList<Card> cards1 = CardUtil.getCards();
        ArrayList<Card> cards2 = CardUtil.getCards();
        assertNotEquals(cards1, cards2);
    }
}
