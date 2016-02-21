import BaseStore        from './BaseStore';
import Immutable        from 'immutable';

export default class GameStore extends BaseStore {

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
