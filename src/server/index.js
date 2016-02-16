// Es6 imports
import gameDispatcher from './dispatcher/GameDispatcher';
import gameStore from './stores/GameStore';

// Start game
onmessage = e => gameDispatcher.dispatch(e.data);
