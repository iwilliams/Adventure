import * as rng from './rng';

// Posible Monsters
export const monsters = [
    {
        'name': 'Rat',
        'hp': 20,
        'mp': 0,
        'description': 'Its a fucken rat b.'
    },
    {
        'name': 'Goblin',
        'hp': 50,
        'mp': 0,
        'description': 'He looks pretty smug.'
    },
    {
        'name': 'Fairy',
        'hp': 30,
        'mp': 50,
        'description': 'Int is for loosers'
    }
];

export class Monster {
    constructor(template) {
        this._name = template.name;
        this._hp = template.hp;
        this._mp = template.mp;
        this._description = template.description;
    }

    static randomMonster() {
        return new Monster(rng.getRandomElement(monsters));
    }
}
