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
    
  }

  public takeEscapeRoute(gameState: GameState): SpaceContains[][] | null {
    const vicinityBoard = this.getVicinityBoard(gameState);
    const myHeadCoord = gameState.you.head;

    // Initialize a 2D array to keep track of visited cells
    const visited: boolean[][] = Array.from({ length: vicinityBoard.length }, () => Array(vicinityBoard[0].length).fill(false));

    // Use DFS to find a continuous, connecting path
    if (this.dfs(myHeadCoord, vicinityBoard, visited)) {
      console.log("other", visited, "something", visited.map((row, rowIndex) => row.map((cell, colIndex) => (cell ? vicinityBoard[rowIndex][colIndex] : 0))))
      return visited.map((row, rowIndex) => row.map((cell, colIndex) => (cell ? vicinityBoard[rowIndex][colIndex] : SpaceContains.MY_HEAD)));
    } else {
      console.log("vissss", visited)
      return null; // No valid path found
    }
  }

  public getVicinityBoard(gameState: GameState): SpaceContains[][] {
    this.gameBoard = this.boardService.board;
    const myHeadCoord = gameState.you.head;
    //treat everything else as a barrier
    //follow tail FIXME
    //look four square radius
    let vicinity = [...this.gameBoard];
    const indicesToSplice: SplicingIndices = this.indicesToSplice(gameState, myHeadCoord);

    vicinity = vicinity.splice(gameState.board.height-indicesToSplice.up, indicesToSplice.up-indicesToSplice.down);
    let index = 0;
    for (let row of vicinity) {
      // console.log("before", row)
      row = row.slice(indicesToSplice.left, indicesToSplice.right);
      // console.log("after", row)
      vicinity[index] = row;
      index++;
    }
    // console.log(vicinity)
    return vicinity;
  }

  private takeLongestRoute(gameState: GameState) {

  }

  private followTail(gameState: GameState) {

  }


  public findAvailableRoute(gameState: GameState, board: SpaceContains[][]) {
    const myHeadCoord = gameState.you.head;

  }

  private indicesToSplice(gameState: GameState, start: Coord): SplicingIndices {
    let indices: SplicingIndices = {left: 0, right: 0, up: 0, down: 0};

    if (start.x - this.vicinityRadius < 0) {
      indices.left = 0;
    } else {
      indices.left = start.x - this.vicinityRadius;
    }

    if (start.x + this.vicinityRadius + 1 >= gameState.board.width) {
      indices.right = gameState.board.width;
    } else {
      indices.right = start.x + this.vicinityRadius + 1;
    }

    if (start.y - this.vicinityRadius < 0) {
      indices.down = 0;
    } else {
      indices.down = start.y - this.vicinityRadius;
    }

    if (start.y + this.vicinityRadius+1 >= gameState.board.height) {
      indices.up = gameState.board.height;
    } else {
      indices.up = start.y + this.vicinityRadius + 1;
    }

    return indices;
  }

  private dfs(startingPoint: Coord, vicinityBoard: SpaceContains[][], visited: boolean[][]): boolean {
    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    const x = startingPoint.x;
    const y = startingPoint.y;

    // Check if the current position is within the grid and is an available space
    if (x < 0 || x >= rows || y < 0 || y >= cols || visited[x][y] || vicinityBoard[x][y] !== SpaceContains.EMPTY || vicinityBoard[x][y] !== SpaceContains.FOOD) {
      return false;
    }
  
    visited[x][y] = true;
  
    // Check adjacent positions
    if (
      this.dfs({x: x - 1, y: y}, vicinityBoard, visited) ||
      this.dfs({x: x + 1, y: y}, vicinityBoard, visited) ||
      this.dfs({x: x, y: y - 1}, vicinityBoard, visited) ||
      this.dfs({x: x, y: y + 1}, vicinityBoard, visited)
    ) {
      return true;
    }
  
    return false;
  }
}