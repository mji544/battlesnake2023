import { Battlesnake, Coord, GameState, MoveResponse } from "./types";

export enum Move {
    UP = "up",
    RIGHT = "right",
    DOWN = "down",
    LEFT = "left",
}

export interface SafeMoves {
    move: Move,
    numOfSafeMoves: number,
}

export enum SpaceContains {
    OPPONENT = "o",
    OPPONENT_HEAD = "oh",
    FOOD = "f",
    ME = "m",
    MY_HEAD = "mh",
    EMPTY = "x",
    ESCAPE_PATH = "ep",
}

export interface SplicingIndices {
    left: number,
    right: number,
    down: number,
    up: number,
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
    let notSafeMoves: Move[] = [];
    for (let move of possibleMoves) {
        const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
        for (let opponent of gameState.board.snakes) {
            if (opponent.id == gameState.you.id) {
                continue;
            }
            if (distanceFromCoordToOpponentHead(opponent, nextMyHeadCoord) <= 1 && (opponent.body.length >= gameState.you.length)) {
                notSafeMoves.push(move);
            }
        }
    }
    
    const safeMoves = possibleMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
}

export function lookAheadForOpponentAndFood(gameState: GameState, possibleMoves: Move[]): Move[] {
    const safeMovesAfterOpponents = lookAheadForOpponent(gameState, possibleMoves);
    let notSafeMoves: Move[] = [];
    for (let move of safeMovesAfterOpponents) {
        const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
        if (getNumberOfSafeMovesAtCoord(gameState, nextMyHeadCoord) <= 1) {
            notSafeMoves.push(move);
        }
    }
    
    const safeMoves = possibleMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
}

export function coordHasMySnake(gameState: GameState, coord: Coord): boolean {
    const mySnake = gameState.you;
    if (bodyHasCoord(mySnake.body, coord) || mySnake.head == coord) {
        return true;
    }
    return false;
}

export function coordHasOpponent(gameState: GameState, coord: Coord): boolean {
    const opponents = gameState.board.snakes;
    for (let opponent of opponents) {
        if (bodyHasCoord(opponent.body, coord)) {
            return true;
        }
    }
    return false;
}

export function coordOutOfBounds(gameState: GameState, coord: Coord): boolean {
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    return coord.x < 0 || coord.x >= boardWidth || coord.y < 0 || coord.y >= boardHeight;
}

export function coordHasFood(gameState: GameState, coord: Coord): boolean {
    const food = gameState.board.food;
    for (let piece of food) {
        if (coordsAreTheSame(piece, coord)) {
            return true;
        }
    }
    return false;
}

export function distanceFromFoodToClosestOpponent(gameState: GameState, foodCoord: Coord): number {
    const snakes = gameState.board.snakes;
    let distance = 0;
    for (let snake of snakes) {
        if (snake.id == gameState.you.id) {
            continue;
        }
        let currentDistance = distanceFromCoordToOpponentHead(snake, foodCoord);
        if (distance == 0 || currentDistance < distance) {
            distance = currentDistance;
        }
    }
    return distance;
}

export function distanceFromCoordToOpponentHead(opponent: Battlesnake, coord: Coord): number {
    return calculateDistance(coord, opponent.head);
}

export function getNumberOfSafeMovesAtCoord(gameState: GameState, coord: Coord): number {
    let moves = [ Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT ];
    let safeMoves: Move[] = [];
    for (let move of moves) {
        let moveCoord = nextCoordAfterMove({ move: move }, coord);
        if (!coordHasOpponent(gameState, moveCoord) && !coordOutOfBounds(gameState, moveCoord) && !coordHasMySnake(gameState, coord)) {
            safeMoves.push(move);
        }
    }
    return safeMoves.length;
}

export function bodyHasCoord(body: Coord[], coord: Coord): boolean {
    for (let bodyPart of body) {
        if (coord.x == bodyPart.x && coord.y == bodyPart.y) {
            return true;
        }
    }
    return false;
}

export function coordsAreTheSame(coordA: Coord, coordB: Coord): boolean {
    if (coordA.x == coordB.x && coordA.y == coordB.y) {
        return true;
    }

    return false;
}

export function takeHighestNumberOfSafeMoves(commonMovesObj: SafeMoves[]): Move | null {
    if (commonMovesObj.length == 0) {
        return null;
    }

    let highestMove = null;
    let numberOfHighestMoves = 0;
    for (let move of commonMovesObj) {
        if (move.numOfSafeMoves > numberOfHighestMoves) {
            highestMove = move.move;
            numberOfHighestMoves = move.numOfSafeMoves;
        }
    }
    return highestMove;
}