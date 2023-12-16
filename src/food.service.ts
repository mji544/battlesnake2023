import { Injectable } from '@nestjs/common';
import { GameState } from './types';
import { Move, SafeMoves, calculateDistance, getNumberOfSafeMovesAtCoord, nextCoordAfterMove } from './utils';

@Injectable()
export class FoodService {
  constructor() {}

  public moveTowardsClosestFood(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let suggestedMoves = [];
    const food = gameState.board.food;
    const myHead = gameState.you.head;
    let distanceToClosestFood = 0;
    let closestFood = null;
    for (let piece of food) {
      if (distanceToClosestFood == 0 || calculateDistance(myHead, piece) < distanceToClosestFood) {
        distanceToClosestFood = calculateDistance(myHead, piece)
        closestFood = piece;
      }
    }

    for (let move of currentSafeMoves) {
      if (calculateDistance(nextCoordAfterMove({ move: move }, myHead), closestFood) < distanceToClosestFood) {
        suggestedMoves.push(move);
      }
    }

    return suggestedMoves;
  }

  public lookAheadConservative(gameState: GameState, possibleMoves: Move[]): [SafeMoves[], Move] {
    let moveWithMostSafeMoves = null;
    let movesWithNumberOfSafeMoves = [];
    let mostAmountOfFutureSafeMoves = 0;
    let numberOfFutureSafeMoves = 0;
    for (let move of possibleMoves) {
      const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
      numberOfFutureSafeMoves = getNumberOfSafeMovesAtCoord(gameState, nextMyHeadCoord);
      movesWithNumberOfSafeMoves.push({move: move, numOfSafeMoves: numberOfFutureSafeMoves});
      if (numberOfFutureSafeMoves > mostAmountOfFutureSafeMoves) {
        mostAmountOfFutureSafeMoves = numberOfFutureSafeMoves;
        moveWithMostSafeMoves = move;
      }
    }
    console.log(movesWithNumberOfSafeMoves, moveWithMostSafeMoves)
    return [movesWithNumberOfSafeMoves, moveWithMostSafeMoves];
  }
}
