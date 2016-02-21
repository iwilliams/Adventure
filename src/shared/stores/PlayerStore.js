import BaseStore        from './BaseStore';
import Immutable        from 'immutable';
import gameDispatcher   from '../dispatcher/GameDispatcher';

let shouldGrow = false;

/**
 * Helper move
 */
function move(state) {
    let dir = state.get('dir');

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
            state = state.updateIn(['xPos'], value => ++value);
            break;
        case 'w':
            state = state.updateIn(['xPos'], value => --value);
            break;
        case 'n':
            state = state.updateIn(['yPos'], value => --value);
            break;
        case 's':
            state = state.updateIn(['yPos'], value => ++value);
            break;
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
    getInitialState() {
        return Immutable.fromJS({
            'xPos': 0,
            'yPos': 0,
            'dir': 'e',
            'tailLength': 1,
            'tail': []
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action, data} = payload;

        switch(action) {
            case 'move':
                state = move(state);
                break;
            case 'dir':
                state = changeDir(state, data);
                break;
            case 'eat':
                shouldGrow = true;
                break;
            case 'restart':
                state = this.getInitialState();
        }

        return state;
    }
}
