// Es6 imports
import gameDispatcher from './dispatcher/GameDispatcher';

// Import Stores
// import GameStore from './stores/GameStore';
import PlayerStore from './stores/PlayerStore';

let playerStore = new PlayerStore(gameDispatcher);


// Start game
//onmessage = e => gameDispatcher.dispatch(e.data);

const FPS = 30;
// Taken from: http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/
let run = (function() {
    var frame = 0;
    var loops = 0, skipTicks = 1000 / FPS,
    maxFrameSkip = 10,
    nextGameTick = (new Date).getTime();

    return function() {
        loops = 0;

        while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
            tick(frame);
            frame = ++frame % FPS;
            nextGameTick += skipTicks;
            loops++;
        }
    };
})();

// Start the game loop
let intervalId = setInterval(run, 1000/FPS/2);

function tick(frame) {
    gameDispatcher.dispatch({
        'action': 'move'
    });

    console.log(playerStore.getState().toJS());
}
