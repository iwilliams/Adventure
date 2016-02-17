import * as rng             from '../server/rng';
import Immutable            from 'immutable';
import patch                from 'immutablepatch';
import * as MessageTypes    from '../shared/constants/MessageConstants';

// Start server
let worker = new Worker('./server/index.js');
window.worker = worker;

var state = null;
worker.onmessage = function(e) {
    let messageType  = e.data[0];
    let payload      = JSON.parse(e.data[1]);
    let stateChange  = false;
    console.log(payload);

    // MessageType constants make this a bit more clear
    switch(messageType) {
        case MessageTypes.NEW_STATE:
            // Make new state
            state = Immutable.fromJS(payload);
            stateChange = true;
            break;
        case MessageTypes.PATCH_STATE:
            // Patch the state
            let ops = Immutable.fromJS(payload);
            let newState = patch(state, ops);
            if(newState !== state) {
                stateChange = true;
                state = newState;
            }
            break;
    }

    // Just re render every time now
    if(stateChange) {
        //render();
    }

    console.log(state.toJS());
}

window.investigate = function(target) {
    let {floor, player, roomIndex} = state.toJS();
    let currentRoom = floor.rooms[roomIndex];
    console.log(currentRoom.description);
}

window.attack = function(target) {
    worker.postMessage({
        'action': 'attack',
        'target': target
    });
}

window.restart = function() {
    worker.postMessage({
        'action': 'restart'
    });
}

window.move = function() {
    worker.postMessage({
        'action': 'move'
    });
}

window.stats = function() {
    worker.postMessage({
        'action': 'status'
    });
}
