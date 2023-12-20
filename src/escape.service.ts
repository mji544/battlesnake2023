import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState, Coord } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, bodyHasCoord, coordHasMySnake, lookAheadForOpponent, SafeMoves, SpaceContains, coordHasFood, SplicingIndices } from './utils';
import { BoardService } from './board.service';

@Injectable()
export class EscapeService {
  gameBoard: SpaceContains[][];
  vicinityRadius = 2;

  constructor(private boardService: BoardService) {}

  public checkIfTrapped() {
    
  }

  // public takeEscapeRoute(gameState: GameState): SpaceContains[][] | null {
  //   const vicinityBoard = this.getVicinityBoard(gameState);
  //   const myHeadVicinityCoord = this.getMyHeadBoardCoord(vicinityBoard);
  //   const myHeadCoord = gameState.you.head;
  //   console.log(myHeadCoord, myHeadVicinityCoord);

  //   const rows = vicinityBoard.length;
  //   const cols = vicinityBoard[0].length;

  //   // Initialize a 2D array to keep track of visited cells
  //   const visited: boolean[][] = Array.from({ length: vicinityBoard.length }, () => Array(vicinityBoard[0].length).fill(false));

  //   // Use DFS to find a continuous, connecting path
  //   if (this.dfs(myHeadVicinityCoord, vicinityBoard, visited, myHeadCoord)) { //{x: rows, y: cols}
  //     console.log(visited)
  //     console.log("somethingg", visited.map((row, rowIndex) => row.map((cell, colIndex) => (cell ? vicinityBoard[rowIndex][colIndex] : SpaceContains.MY_HEAD))))
  //     // console.log("other", visited, "something", visited.map((row, rowIndex) => row.map((cell, colIndex) => (vicinityBoard[rowIndex][colIndex]))))
  //     return visited.map((row, rowIndex) => row.map((cell, colIndex) => (cell ? vicinityBoard[rowIndex][colIndex] : SpaceContains.ESCAPE_PATH)));
  //   } else {
  //     console.log(visited)
  //     console.log("vissss")//, visited)
  //     return null; // No valid path found
  //   }
  // }

  public getVicinityBoard(gameState: GameState): SpaceContains[][] {
    this.gameBoard = this.boardService.board;
    const myHeadCoord = gameState.you.head;
    //treat everything else as a barrier
    //follow tail FIXME
    //look four square radius
    let vicinity = [...this.gameBoard];
    const indicesToSplice: SplicingIndices = this.indicesToSplice(gameState, myHeadCoord);

    vicinity = vicinity.slice(gameState.board.height-indicesToSplice.up, gameState.board.height-indicesToSplice.down);
    let index = 0;
    for (let row of vicinity) {
      // console.log("before", row)
      row = row.slice(indicesToSplice.left, indicesToSplice.right);
      // console.log("after", row)
      vicinity[index] = row;
      index++;
    }
    console.log(vicinity)
    return vicinity;
  }

  public findLongestRoute(gameState: GameState): Coord[] {
    const vicinityBoard = this.getVicinityBoard(gameState);
    const myHeadVicinityCoord = this.getMyHeadBoardCoord(vicinityBoard);
    const myHeadCoord = gameState.you.head;
    console.log(myHeadCoord, myHeadVicinityCoord, "here");

    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    
    // Initialize a 2D array to keep track of visited cells
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  
    // Initialize an empty array to store the longest path
    let longestPath: Coord[] = [];
  
    // Use DFS to find the longest continuous, connecting path
    longestPath = this.dfsLongestPath(myHeadVicinityCoord, vicinityBoard,visited, []);
  
    console.log("longest path:", longestPath)
    // If no valid path is found, return null
    if (longestPath.length === 0) {
      return null;
    }
  
    return null;//longestPath;
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

  private dfs(startingPoint: Coord, vicinityBoard: SpaceContains[][], visited: boolean[][], myHeadCoordOnBoard: Coord): boolean {
    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    const x = startingPoint.x;
    const y = startingPoint.y;

    // Check if the current position is within the grid and is an available space
    if (x < 0 || x >= rows || y < 0 || y >= cols || visited[x][y] || (vicinityBoard[x][y] != SpaceContains.EMPTY && vicinityBoard[x][y] != SpaceContains.FOOD)) {
      return false;
    }
  
    visited[x][y] = true;

    // If the current cell is on the border of the grid
    if (x === 0 || x === rows - 1 || y === 0 || y === cols - 1) {
      return true;
    }

    // Recursively check adjacent positions
    return (
      this.dfs({x: x - 1, y: y}, vicinityBoard, visited, myHeadCoordOnBoard) ||
      this.dfs({x: x + 1, y: y}, vicinityBoard, visited, myHeadCoordOnBoard) ||
      this.dfs({x: x, y: y - 1}, vicinityBoard, visited, myHeadCoordOnBoard) ||
      this.dfs({x: x, y: y + 1}, vicinityBoard, visited, myHeadCoordOnBoard)
    );
  }

  private dfsLongestPath(startingPoint: Coord, vicinityBoard: SpaceContains[][], visited: boolean[][], currentPath: Coord[]): Coord[] {
    const rows = vicinityBoard.length;
    const cols = vicinityBoard[0].length;
    const x = startingPoint.x;
    const y = startingPoint.y;

    // Check if the current position is within the grid and is an available space
    console.log(y < 0, y >= rows, x < 0 , x >= cols , visited[y][x] , (vicinityBoard[y][x] != SpaceContains.EMPTY && vicinityBoard[y][x] != SpaceContains.FOOD))
    if (y < 0 || y >= rows || x < 0 || x >= cols || visited[y][x] || (vicinityBoard[y][x] != SpaceContains.EMPTY && vicinityBoard[y][x] != SpaceContains.FOOD)) {
      return [...currentPath];
    }

    // Mark the current cell as visited
    visited[y][x] = true;

    // Add the current cell to the current path
    currentPath.push(startingPoint);

    // Recursively check adjacent positions
    const nextPath = [
      this.dfsLongestPath({x: x - 1, y: y}, vicinityBoard, visited, [...currentPath]),
      this.dfsLongestPath({x: x + 1, y: y}, vicinityBoard, visited, [...currentPath]),
      this.dfsLongestPath({x: x, y: y - 1}, vicinityBoard, visited, [...currentPath]),
      this.dfsLongestPath({x: x, y: y + 1}, vicinityBoard, visited, [...currentPath])
    ];

    // Find the longest path among the recursive results
    const longestPath = nextPath.reduce((longest, path) => (path.length > longest.length ? path : longest), []);

    console.log("longest", longestPath, "current", currentPath)

    // Backtrack: mark the current cell as unvisited and remove it from the current path
    visited[y][x] = false;
    currentPath.pop();

    return longestPath;
  }

  private getMyHeadBoardCoord(vicinityBoard: SpaceContains[][]): Coord {
    for (let rowIndex = 0; rowIndex < vicinityBoard.length; rowIndex++) {
      if (vicinityBoard[rowIndex].indexOf(SpaceContains.MY_HEAD) != -1) {
        return {x: vicinityBoard[rowIndex].indexOf(SpaceContains.MY_HEAD), y: rowIndex}
      }
    }
  }
}