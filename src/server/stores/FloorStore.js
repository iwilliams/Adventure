import BaseStore        from './BaseStore';
import {monsters}       from '../monster';
import {generateFloor}  from '../dungeon';
import * as rng         from '../rng';
import Immutable        from 'immutable';
import gameDispatcher   from '../dispatcher/GameDispatcher';

class FloorStore extends BaseStore {

    getInitialState() {
        return Immutable.List.of(...generateFloor());
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action} = payload;

        switch(action) {
                break;
        }

        return state;
    }
}

export default new FloorStore(gameDispatcher);
