import MainLoop             from '../shared/mainloop';
import StoreFactory         from '../shared/services/StoreFactory';
import gameDispatcher       from '../shared/dispatcher/GameDispatcher';

import * as GameConstants   from '../shared/constants/GameConstants';
import * as Stores          from '../shared/constants/StoreConstants';
import * as MessageTypes    from '../shared/constants/MessageConstants';

let playerStore = StoreFactory.create(Stores.PLAYER_STORE);
let floorStore  = StoreFactory.create(Stores.FLOOR_STORE);

function tick(frame) {
    let playerState = playerStore.getState();
    let floorState  = floorStore.getState();

    let canMove     = true;
    let playerDir   = playerState.get('dir');
    let newPos      = [playerState.get('xPos'), playerState.get('yPos')];

    switch(playerDir) {
        case 'e':
            newPos[0] += 1;
            break;
        case 'w':
            newPos[0] -= 1;
            break;
        case 'n':
            newPos[1] -= 1;
            break;
        case 's':
            newPos[1] += 1;
            break;
    }

    if(newPos[0] < floorState.get('width')
            && newPos[0] >= 0
            && newPos[1] < floorState.get('height')
            && newPos[1] >= 0) {

        for(let i = 0; i < playerState.get('tail').size; i++) {
            let tailSegment = playerState.getIn(['tail', i]);

            if(newPos[0] === tailSegment[0] && newPos[1] === tailSegment[1]) {
                canMove = false;
                break;
            }
        }
    } else {
        canMove = false;
    }

    if(canMove) {
        gameDispatcher.dispatch({
            'action': 'move'
        });
    } else {
        gameDispatcher.dispatch({
            'action': 'restart'
        });
    }

    if(playerState.get('xPos') === floorState.get('dotX') && playerState.get('yPos') === floorState.get('dotY')) {
        gameDispatcher.dispatch({
            'action': 'eat'
        });
    }
}
MainLoop.setSimulationFPS(GameConstants.SIMULATION_FPS);
MainLoop.setUpdate(tick).start();

onmessage = function(e) {
    let data         = e.data;
    let messageType  = data.shift();
    let payload      = data;

    // MessageType constants make this a bit more clear
    switch(messageType) {
        case MessageTypes.PLAYER_INPUT:
            gameDispatcher.dispatch({
                'action': 'dir',
                'data': payload[0]
            });
            break;
    }
}
