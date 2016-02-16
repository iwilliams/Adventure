import BaseStore        from './BaseStore';
import {monsters}       from '../monster';
import {generateFloor}  from '../dungeon';
import * as rng         from '../rng';
import Immutable        from 'immutable';
import gameDispatcher   from '../dispatcher/GameDispatcher';

class GameStore extends BaseStore {

    getInitialState() {
        return Immutable.Map({
            running: true,
            enemiesKilled: 0,
            roomIndex: 0,
            floorCount: 0,
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action} = payload;

        switch(action) {
            case 'move':

                break;
            case 'attack':
                break;
        }

        return state;
    }
}

export default new GameStore(gameDispatcher);
