import * as rng from './rng'

// Posible Monsters
let monsters = [
    (() => {
        return {
            'name': 'Rat',
            'hp': 100,
            'mp': 0,
            'description': 'Its a fucken rat b'
        }
    }),
    (() => {
        return {
            'name': 'Goblin',
            'hp': 200,
            'mp': 0,
            'description': 'He looks pretty smug'
        }
    }),
    (() => {
        return {
            'name': 'Fairy',
            'hp': 150,
            'mp': 50,
            'description': 'Int is for loosers'
        }
    })
];

// Initial Game state
function getInitialGameState() {
    return {
        running: true,
        enemiesKilled: 0,
        floor: generateFloor(),
        currentRoom: 0,
        player: {
            'name': '',
            'hp': 400,
            'mp': 50,
            'actions': ['attack', 'investigate', 'move']
        },
        getCurrentRoom() {
            return this.floor.rooms[this.currentRoom];
        }
    }
}
let game = getInitialGameState();


// Generate random room
function getRandomRoom(idx) {
    let room = {};

    // Set room description
    let descriptions = [
        'A torch mounted on the wall, flickers in darkness.',
        'Chains hang from the wall, a pile of bones lay beneath.',
        'From the ceiling water leaks forming a puddle at your feet.'
    ];
    room.description = rng.getRandomElement(descriptions);

    // Determine monsters
    room.monsters = [];
    if(idx) {
        let numMonsters = rng.randomRange(0, 4);
        let roomMonsters    = [];
        for(let i = 0; i < numMonsters; i++) {
            roomMonsters.push(rng.getRandomElement(monsters)());
        }
        room.monsters = roomMonsters;
    }

    return room;
}

// Generate Floor
function generateFloor() {
    let rooms = [];
    let numRooms = rng.randomRange(3, 8);

    for(let i = 0; i < numRooms; i++) {
        rooms.push(getRandomRoom(i));
    }

    return {
        'rooms': rooms
    }
}

// Start game
postMessage(game.getCurrentRoom().description);

// Handle actions
onmessage = function(e) {
    let message = e.data;
    if(message.action === 'investigate') {
        let currentRoom = game.getCurrentRoom();
        postMessage(currentRoom.description);

        if(message.target === undefined) {
            if(currentRoom.monsters.length) {
                let numMonsters = currentRoom.monsters.length;
                postMessage(`There ${(numMonsters == 1 ? 'is' : 'are')} ${numMonsters} monster${(numMonsters == 1 ? '': 's')} in the room.`);
            } else {
                postMessage('Nothing to see here...');
            }
        } else {
            let badie = currentRoom.monsters[message.target];
            if(badie) {
                postMessage(`You examine the ${badie.name}. ${badie.description}.`);
                postMessage(`Health: ${badie.hp}`);
            } else {
                postMessage('Invalid target.');
            }
        }
    } else if(message.action === 'move') {
        // Check if monsters are present.
        if(game.getCurrentRoom().monsters.length) {
            postMessage('You try to escape...');

            if(!(rng.d20() >= 15)) {
                postMessage('The monsters block your path!');
                return;
            }
        }

        game.currentRoom++;
        if(game.currentRoom === game.floor.rooms.length) {
            postMessage('You Win!');
            game.running = false;
        } else {
            postMessage(game.getCurrentRoom().description);
        }
    } else if(message.action === 'attack') {
        let target = null;

        // Do we have a target in mind?
        if(message.target === undefined) {
            postMessage(`You swing wildly!`);

            // If there are targets attack one of them.
            if(game.getCurrentRoom().monsters.length) {
                target = rng.getRandomElement(game.getCurrentRoom().monsters);
            }
        } else {
            target = game.getCurrentRoom().monsters[message.target];
        }

        // If we have found a valid target, then attack it.
        if(target) {
            let damage = rng.d20() * rng.d4();

            target.hp -= damage;

            postMessage(`You hit the ${target.name} for ${damage} damage!`);

            if(target.hp <= 0) {
                postMessage(`You slay the ${target.name}`);
                game.getCurrentRoom()
                    .monsters.splice(game.getCurrentRoom().monsters.indexOf(target), 1);
            }
        } else {
            if(message.target === undefined) {
                postMessage('Invalid target.');
            } else {
                postMessage('There is nothing to attack...');
            }
        }
    } else if (message.action === 'restart') {
        game = getInitialGameState();
    } else if (message.action === 'status') {
        postMessage(`Your HP is ${game.player.hp}`);
    }
}

setInterval(() => {
    // Check if the game is still in progress.
    if(game.running) {
        let monsters = game.getCurrentRoom().monsters;

        if(monsters.length) {
            let roll = rng.d10();
            if(roll > 5) {
                let attackingMonster = rng.getRandomElement(monsters);
                postMessage(`The ${attackingMonster.name} attacks!`);
                game.player.hp -= rng.d4() * rng.d10();

                if(game.player.hp <= 0) {
                    postMessage(`<p style="color: red">You defeated. R.I.P. in peace.</p>`);
                    game.running = false;
                } else {
                    postMessage(`<p style="color:red" >You taste the pain. HP: ${game.player.hp}</p>`);
                }
            }
        }
    }
}, 1000);
