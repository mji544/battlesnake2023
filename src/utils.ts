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

export function nextCoordAfterMove(moveDirection: MoveResponse, currentHeadCoord: Coord): Coord {
    if (moveDirection.move == Move.RIGHT) {
        return { x: currentHeadCoord.x + 1, y: currentHeadCoord.y }
    } else if (moveDirection.move == Move.LEFT) {
        return { x: currentHeadCoord.x - 1, y: currentHeadCoord.y }
    } else if (moveDirection.move == Move.UP) {
        return { x: currentHeadCoord.x, y: currentHeadCoord.y + 1 }
    } else {
        return { x: currentHeadCoord.x, y: currentHeadCoord.y - 1 }
    }
}

export function lookAheadForOpponent(gameState: GameState, possibleMoves: Move[]): Move[] {
    let safeMoves: Move[] = [];
    let notSafeMoves: Move[] = [];
    for (const move of possibleMoves) {
        const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
        for (let opponent of gameState.board.snakes) {
            if (distanceFromCoordToOpponentHead(opponent, nextMyHeadCoord) <= 1 && (opponent.body.length >= gameState.you.length)) {
                notSafeMoves.push(move);
            }
        }
    }
    safeMoves = possibleMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
}

export function coordHasMySnake(gameState: GameState, coord: Coord): boolean {
    const mySnake = gameState.you;
    if (mySnake.body.includes(coord) || mySnake.head == coord) {
        return true;
    }
    return false;
}

export function coordHasOpponent(gameState: GameState, coord: Coord): boolean {
    const opponents = gameState.board.snakes;
    opponents.forEach((opponent) => {
        if (opponent.body.includes(coord)) {
            return true;
        }
    });
    return false;
}

export function coordOutOfBounds(gameState: GameState, coord: Coord): boolean {
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    return coord.x < 0 || coord.x >= boardWidth || coord.y < 0 || coord.y >= boardHeight;
}

export function distanceFromCoordToOpponentHead(opponent: Battlesnake, coord: Coord): number {
    return calculateDistance(coord, opponent.head);
}

export function getNumberOfSafeMovesAtCoord(gameState: GameState, coord: Coord): number {
    let moves = [ Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT ];
    let safeMoves: Move[] = [];
    for (const move of moves) {
        let moveCoord = nextCoordAfterMove({ move: move }, coord);
        if (!coordHasOpponent(gameState, moveCoord) && !coordOutOfBounds(gameState, moveCoord) && !coordHasMySnake(gameState, coord)) {
            safeMoves.push(move);
        }
    }
    return safeMoves.length;
}