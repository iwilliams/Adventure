import BaseStore            from './BaseStore';
import Immutable            from 'immutable';
import gameDispatcher       from '../dispatcher/GameDispatcher';
import * as StoreConstants  from '../constants/StoreConstants';

let shouldGrow = false;

/**
 * Helper move
 */
let moveDelta = 0;
function move(state, delta) {
    let dir = state.get('dir');

    moveDelta += delta;
    let dist = 0;
    let velocity = state.get('velocity');
    if(moveDelta >= 1000/velocity) {
        dist = 1;
        moveDelta = 0;
    }

    if(dist) {
        state = state.updateIn(['tail'], list => {
            if(shouldGrow) {
                shouldGrow = false;
            } else {
                list = list.shift();
            }
            return list.push([state.get('xPos'), state.get('yPos')])
        });


        switch(dir) {
            case 'e':
                state = state.updateIn(['xPos'], value => value + dist);
                break;
            case 'w':
                state = state.updateIn(['xPos'], value => value - dist);
                break;
            case 'n':
                state = state.updateIn(['yPos'], value => value - dist);
                break;
            case 's':
                state = state.updateIn(['yPos'], value => value + dist);
                break;
        }
    }

    return state;
}

/**
 * ChangeDir helper
 */
function changeDir(state, dir) {
    let currentDir = state.get('dir');
    let nextDir    = dir;

    // Make sure we don't double back on self
    let shouldChange = false;
    switch(currentDir) {
        case 'n':
            if(nextDir !== 's') {
                shouldChange = true;
            }
            break;
        case 's':
            if(nextDir !== 'n') {
                shouldChange = true;
            }
            break;
        case 'e':
            if(nextDir !== 'w') {
                shouldChange = true;
            }
            break;
        case 'w':
            if(nextDir !== 'e') {
                shouldChange = true;
            }
            break;
    }

    // Update state
    if(shouldChange) {
        state = state.updateIn(['dir'], value => dir);
    }

    return state;
}

export default class PlayerStore extends BaseStore {

    constructor() {
        super(...arguments);
        this.type = StoreConstants.PLAYER_STORE;
    }

    getInitialState() {
        return Immutable.fromJS({
            'xPos': 0,
            'yPos': 0,
            'dir': 'e',
            'tailLength': 1,
            'tail': [[0, 0], [0, 0]],
            'velocity': 20
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action, data} = payload;

        switch(action) {
            case 'move':
                state = move(state, data);
                break;
            case 'dir':
                state = changeDir(state, data);
                //state = state.updateIn(['dir'], value => data);
                break;
            case 'eat':
                shouldGrow = true;
                break;
            case 'restart':
                state = this.getInitialState();
                break;
        }

        //console.log(state.get('velocity'));

        return state;
    }
}
