package com.kentrichards.codenames;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@RestController
public class GameController {
    @GetMapping("/{id}")
    public Game byId(@PathVariable String id) {
        ArrayList<Card> deck = CardUtil.getCards();
        ArrayList<Player> team = new ArrayList<>();
        team.add(new Player(Team.BLUE, Role.SPYMASTER));
        team.add(new Player(Team.BLUE, Role.OPERATIVE));
        team.add(new Player(Team.RED, Role.SPYMASTER));
        team.add(new Player(Team.RED, Role.OPERATIVE));

        return new Game(id, deck, team);
    }
}
