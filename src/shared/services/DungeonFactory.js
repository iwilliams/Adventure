import {TILE_AIR, TILE_FLOOR, TILE_WALL} from '../constants/DungeonConstants';
import * as Rng from '../utils/Rng';

function createTile(type, item = null) {
    return {
        type: type,
        item: item
    };
}

export function generateDungeon() {

    let dungeonHeight = 3;
    let dungeonWidth  = 10;
    let dungeonDepth  = 10;

    let tiles = [];
    for(let y = 0; y < dungeonHeight; y++) {
        tiles.push([]);
        for (let z = 0; z < dungeonDepth; z++) {
            tiles[y].push([]);
            for(let x = 0; x < dungeonWidth; x++) {
                let tileToAdd = createTile(TILE_AIR);

                if(y === 0) {
                    tileToAdd = createTile(TILE_FLOOR);
                } else if (y === 1 && (
                            z === 0 ||
                            z === dungeonDepth - 1 ||
                            x === 0 ||
                            x === dungeonWidth - 1)) {
                    tileToAdd = createTile(TILE_WALL);
                } else if(y === 2) {
                    tileToAdd = createTile(TILE_FLOOR);
                }

                if(y === 1 && tileToAdd.type === TILE_AIR && Rng.d10() > 7) {
                    tileToAdd = createTile(TILE_AIR, 0);
                }

                tiles[y][z].push(tileToAdd);
            }
        }
    }
    return tiles;
}
