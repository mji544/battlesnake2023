import { Battlesnake, Coord, GameState, MoveResponse } from "./types";

export enum Move {
    UP = "up",
    RIGHT = "right",
    DOWN = "down",
    LEFT = "left",
}

export function calculateDistance(a: Coord, b: Coord): number {
    // number of spaces
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function nextCoordAfterMove(possibleMove: MoveResponse, currentHeadCoord: Coord): Coord {
    if (possibleMove.move == Move.RIGHT) {
        return { x: currentHeadCoord.x + 1, y: currentHeadCoord.y }
    } else if (possibleMove.move == Move.LEFT) {
        return { x: currentHeadCoord.x - 1, y: currentHeadCoord.y }
    } else if (possibleMove.move == Move.UP) {
        return { x: currentHeadCoord.x, y: currentHeadCoord.y + 1 }
    } else {
        return { x: currentHeadCoord.x, y: currentHeadCoord.y - 1 }
    }
}

export function lookAhead(gameState: GameState, possibleMove: MoveResponse | null): boolean {
    if (possibleMove == null) {
        return false;
    }

    // let numberOfFutureSafeMoves = 0;
    const nextMyHeadCoord = nextCoordAfterMove(possibleMove, gameState.you.head)
    for (let opponent of gameState.board.snakes) {
        if (calculateDistance(nextMyHeadCoord, opponent.head) <= 1 && (opponent.body.length >= gameState.you.length)) {
            return false;
        }
    }
    return true;
}