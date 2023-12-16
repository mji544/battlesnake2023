import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState, Coord } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, bodyHasCoord, coordHasMySnake, lookAheadForOpponent, SafeMoves, SpaceContains, coordHasFood, coordsAreTheSame } from './utils';

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
    
    // console.log(this.board)
    return this.board;
  }

  private getSpaceContainsAtCoord(gameState: GameState, coord: Coord): SpaceContains {
    if (coordHasFood(gameState, coord)) {
        return SpaceContains.FOOD;
    }

    for (let snake of gameState.board.snakes) {
        if (bodyHasCoord(snake.body, coord)) {
            return this.setSpaceAsBodyOrHead(gameState, snake, coord);
        }
    }

    return SpaceContains.EMPTY;
  }

  private setSpaceAsBodyOrHead(gameState: GameState, snake: Battlesnake, coord: Coord): SpaceContains {
    if (snake.id == gameState.you.id) {
        if (coordsAreTheSame(snake.head, coord)) {
            return SpaceContains.MY_HEAD;
        }
        return SpaceContains.ME;
    }
    
    if (coordsAreTheSame(snake.head, coord)) {
        return SpaceContains.OPPONENT_HEAD;
    }
    return SpaceContains.OPPONENT;
  }

}