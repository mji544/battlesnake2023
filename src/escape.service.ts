import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState, Coord } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, bodyHasCoord, coordHasMySnake, lookAheadForOpponent, SafeMoves, SpaceContains, coordHasFood, SplicingIndices } from './utils';
import { BoardService } from './board.service';

@Injectable()
export class EscapeService {
  gameBoard: SpaceContains[][];
  vicinityRadius = 3;

  constructor(private boardService: BoardService) {}

  public checkIfTrapped() {
    this.gameBoard = this.boardService.board;
  }

  public takeEscapeRoute(gameState: GameState) {
    this.checkIfTrapped();
    const myHeadCoord = gameState.you.head;
    //treat everything else as a barrier
    
    //look four square radius
    let vicinity = this.gameBoard;
    const indicesToSplice: SplicingIndices = this.indicesToSplice(gameState, myHeadCoord);
    // splice rows
    vicinity = vicinity.splice(indicesToSplice.down, indicesToSplice.up-indicesToSplice.down);
    for (let row of vicinity) {
      row.splice(indicesToSplice.left, indicesToSplice.right-indicesToSplice.left);
    }

    console.log(vicinity, this.gameBoard)
  }

  private takeLongestRoute(gameState: GameState) {

  }



  private indicesToSplice(gameState: GameState, start: Coord): SplicingIndices {
    let indices: SplicingIndices = {left: 0, right: 0, up: 0, down: 0};

    if (start.x - this.vicinityRadius < 0) {
      indices.left = 0;
    } else {
      indices.left = start.x - this.vicinityRadius;
    }

    if (start.x + this.vicinityRadius >= gameState.board.width) {
      indices.right = gameState.board.width;
    } else {
      indices.right = start.x + this.vicinityRadius;
    }

    if (start.y - this.vicinityRadius < 0) {
      indices.down = 0;
    } else {
      indices.down = start.y - this.vicinityRadius;
    }

    if (start.y + this.vicinityRadius >= gameState.board.height) {
      indices.up = gameState.board.height;
    } else {
      indices.up = start.y + this.vicinityRadius;
    }

    return indices;
  }
}