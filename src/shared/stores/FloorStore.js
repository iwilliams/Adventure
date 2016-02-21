import BaseStore            from './BaseStore';
//import {generateFloor}  from '../dungeon';
import * as rng             from '../utils/Rng';
import Immutable            from 'immutable';
import * as GameConstants   from '../constants/GameConstants';

export default class FloorStore extends BaseStore {

    //getInitialState() {
        //return Immutable.List.of(...generateFloor());
    //}

    getInitialState() {
        return Immutable.Map({
            width: GameConstants.GAME_WIDTH,
            height: GameConstants.GAME_HEIGHT,
            dotX: rng.randomRange(1, GameConstants.GAME_WIDTH),
            dotY: rng.randomRange(1, GameConstants.GAME_HEIGHT)
        });
    }

    /*
     * Will be called on dispatch
     */
    reduce(state, payload) {
        let {action} = payload;

        switch(action) {
            case 'eat':
                state = state.set('dotX', rng.randomRange(0, GameConstants.GAME_WIDTH));
                state = state.set('dotY', rng.randomRange(0, GameConstants.GAME_HEIGHT));
                break;
            case 'restart':
                state = this.getInitialState();
        }

        return state;
    }
}
