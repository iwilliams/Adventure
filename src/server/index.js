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
        rooms: 0,
        player: {
            'name': '',
            'hp': 400,
            'mp': 50,
            'actions': ['attack', 'investigate', 'move']
        }
    }
}
let game = getInitialGameState();

// Copied from MDN
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function d6() {
    return getRandomInt(0, 7);
}

function d10() {
    return getRandomInt(0, 11);
}

function d20() {
    return getRandomInt(0, 21);
}

// Generate random room
function getRandomRoom() {
    let numMonsters = getRandomInt(0, 4);
    let roomMonsters    = [];

    for(let i = 0; i < numMonsters; i++) {
        roomMonsters.push(monsters[getRandomInt(0, monsters.length)]());
    }

    return {
        'numMonsters': numMonsters,
        'monsters': roomMonsters,
        'description': 'You are standing in a dank dungeon.'
    }
}

// Start game
game.room = getRandomRoom();
postMessage(game.room.description);

// Handle actions
onmessage = function(e) {
    let message = e.data;

    if(message.action === 'investigate') {
        if(message.target === undefined) {
            let numMonsters = game.room.monsters.length;
            postMessage(`There ${(numMonsters == 1 ? 'is' : 'are')} ${numMonsters} monster${(numMonsters == 1 ? '': 's')} in the room.`);
        } else {
            let badie = game.room.monsters[message.target];
            postMessage(`You examine the ${badie.name}. ${game.room.monsters[message.target].description}.`);
            postMessage(`Health: ${badie.hp}`);
        }
    } else if(message.action === 'move') {
        game.room = getRandomRoom();
        postMessage(game.room.description);
    } else if(message.action === 'attack') {
        if(message.target === undefined) {
            postMessage(`You swing wildly!`);
            let numMonsters = game.room.monsters.length;

            if(numMonsters) {
                let randomMonster = game.room.monsters[getRandomInt(0, numMonsters)];
                randomMonster.hp -= 30;
                if(randomMonster.hp <= 0) {
                    postMessage(`You slay the ${randomMonster.name}`);
                    game.room.monsters.splice(game.room.monsters.indexOf(randomMonster), 1);
                } else {
                    postMessage(`You damage the ${randomMonster.name}`);
                }

            } else {
                postMessage(`Theres nothing to hit...`);
            }
        } else {
            let monster = game.room.monsters[message.target];
            monster.hp -= 30;
            if(monster.hp <= 0) {
                postMessage(`You slay the ${monster.name}`);
                game.room.monsters.splice(game.room.monsters.indexOf(monster), 1);
            } else {
                postMessage(`You damage the ${monster.name}`);
            }
        }
    } else if (message.action === 'restart') {
        game = getInitialGameState();
        game.room = getRandomRoom();
    } else if (message.action === 'status') {
        postMessage(`Your HP is ${game.player.hp}`);
    }
}

setInterval(() => {
    if(game.running && game.room.monsters.length) {
        let roll = d10();
        let numMonsters = game.room.monsters.length;
        if(roll > 5) {
            let attackingMonster = game.room.monsters[getRandomInt(0, numMonsters)];
            postMessage(`The ${attackingMonster.name} attacks!`);
            game.player.hp -= 20;
            if(game.player.hp <= 0) {
                postMessage(`<p style="color: red">You defeated. R.I.P. in peace.</p>`);
                game.running = false;
            } else {
                postMessage(`<p style="color:red" >You taste the pain. HP: ${game.player.hp}</p>`);
            }
        }
    }
}, 1000);
