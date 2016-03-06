import * as GameConstants       from '../constants/GameConstants';
import * as StoreConstants      from '../constants/StoreConstants';
import * as MessageConstants    from '../constants/MessageConstants';
import {randomId}               from '../utils/Utils';
import dispatcher               from '../dispatcher/GameDispatcher';

// Stores
import GameStore            from '../stores/GameStore';
import PlayerStore          from '../stores/PlayerStore';
import FloorStore           from '../stores/FloorStore';

class StoreFactory {
    constructor() {
        this.stores = new Map();
    }

    /**
     * Create a store by type
     */
    create(storeType, id, state) {
        let newStore;
        let storeClass;

        // Set the store class based on type
        switch(storeType) {
            case StoreConstants.GAME_STORE:
                storeClass = GameStore;
                break;
            case StoreConstants.PLAYER_STORE:
                storeClass = PlayerStore;
                break;
            case StoreConstants.FLOOR_STORE:
                storeClass = FloorStore;
                break;
            default:
                storeClass = undefined;
                break;
        }

        // If we found the storeType
        if(storeClass) {
            id = id || randomId();
            newStore = new storeClass(id, dispatcher, state);
            this.stores.set(newStore.id, newStore);

            if(GameConstants.IS_SERVER) {
                postMessage([
                        MessageConstants.CREATE_STORE,
                        storeType,
                        id,
                        JSON.stringify(newStore.getState())
                ]);
            }
        }

        return newStore;
    }

    /**
     * Lookup store by id
     */
    lookup(storeID) {
        return this.stores.get(storeID);
    }

    /**
     * getByType
     *
     * Get stores by type
     */
    getByType(type) {
        let stores = this.stores.values();
        let storesToReturn = [];

        let store = stores.next();
        while(!store.done) {
            if(store.value.type === type)
                storesToReturn.push(store.value);
            store = stores.next();
        }

        return storesToReturn;
    }
}

export default new StoreFactory();
