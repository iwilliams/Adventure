import * as rng from './rng';
import {Monster} from './monster';

export const EVENT_BATTLE      = 0;
export const EVENT_MERCHANT    = 1;
export const EVENT_LOOT        = 2;

const events = [
    EVENT_BATTLE,
    EVENT_MERCHANT,
    EVENT_LOOT
];

const roomDescriptions = [
    'A torch mounted on the wall, flickers in darkness.',
    'Chains hang from the wall, a pile of bones lay beneath.',
    'From the ceiling water leaks forming a puddle at your feet.'
];

/**
 * Generate Random Room
 */
export function getRandomRoom(idx) {
    let room = {};

    // Set room description
    room.description = rng.getRandomElement(roomDescriptions);

    // Never have event on first room of floor
    if(!idx) return room;

    room.event = rng.getRandomElement(events, [EVENT_MERCHANT]);

    // Determine monsters
    room.monsters = [];

    if(room.event === EVENT_BATTLE) {
        let numMonsters = rng.randomRange(0, 4);
        let roomMonsters    = [];
        for(let i = 0; i < numMonsters; i++) {
            roomMonsters.push(Monster.randomMonster());
        }
        room.monsters = roomMonsters;
    }

    return room;
}

export function generateFloor(minRooms = 3, maxRooms = 8) {
    let rooms = [];
    let numRooms = rng.randomRange(minRooms, maxRooms);

    for(let i = 0; i < numRooms; i++) {
        rooms.push(getRandomRoom(i));
    }

    return {
        'rooms': rooms
    }
}
