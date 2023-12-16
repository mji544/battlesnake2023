import { Injectable } from '@nestjs/common';
import { GameState } from './types';
import { Move, calculateDistance, getNumberOfSafeMovesAtCoord, nextCoordAfterMove } from './utils';

@Injectable()
export class FoodService {
  constructor() {}

  public moveTowardsClosestFood(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let suggestedMoves = [];
    const food = gameState.board.food;
    const myHead = gameState.you.head;
    let distanceToClosestFood = 0;
    let closestFood = null;
    food.forEach((food) => {
      if (distanceToClosestFood == 0 || calculateDistance(myHead, food) < distanceToClosestFood) {
        distanceToClosestFood = calculateDistance(myHead, food)
        closestFood = food;
      }
    });

    for (const move of currentSafeMoves) {
      if (calculateDistance(nextCoordAfterMove({ move: move }, myHead), closestFood) < distanceToClosestFood) {
        suggestedMoves.push(move);
      }
    }

    return suggestedMoves;
  }

  public lookAheadConservative(gameState: GameState, possibleMoves: Move[]): Move {
    let moveWithMostSafeMoves = null;
    let mostAmountOfFutureSafeMoves = 0;
    let numberOfFutureSafeMoves = 0;
    for (const move of possibleMoves) {
      const nextMyHeadCoord = nextCoordAfterMove({ move: move }, gameState.you.head)
      numberOfFutureSafeMoves = getNumberOfSafeMovesAtCoord(gameState, nextMyHeadCoord);
      if (numberOfFutureSafeMoves > mostAmountOfFutureSafeMoves) {
        mostAmountOfFutureSafeMoves = numberOfFutureSafeMoves;
        moveWithMostSafeMoves = move;
      }
    }
    return moveWithMostSafeMoves;
  }
}
