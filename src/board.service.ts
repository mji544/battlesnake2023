import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState, Coord } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, bodyHasCoord, coordHasMySnake, lookAheadForOpponent, SafeMoves, SpaceContains } from './utils';

@Injectable()
export class BoardService {
  board: SpaceContains[][] = [];
  boardHeight: number;
  boardWidth: number;

  constructor() {}

  public getBoard(gameState: GameState): SpaceContains[][] {
    return this.setupBoard(gameState);
  }

  private setupBoard(gameState: GameState): SpaceContains[][] {
    this.boardHeight = gameState.board.height;
    this.boardWidth = gameState.board.width;
    this.board = [];

    for (let row = this.boardHeight-1; row >= 0; row--) {
        let boardRow = [];
        for (let col = 0; col < this.boardWidth; col++) {
            boardRow.push(this.getSpaceContainsAtCoord(gameState, { x: col, y: row }));
        }
        this.board.push(boardRow);
    }
    
    console.log(this.board)
    return this.board;
  }

  private getSpaceContainsAtCoord(gameState: GameState, coord: Coord): SpaceContains {
    if (gameState.board.food.includes(coord)) {
        return SpaceContains.FOOD;
    }

    for (let snake of gameState.board.snakes) {
        if (snake.body.includes(coord)) {
            if (snake.id == gameState.you.id) {
                return SpaceContains.ME;
            }
            return SpaceContains.OPPONENT;
        }
    }

    return SpaceContains.EMPTY;
  }

}