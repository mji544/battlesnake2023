import { Injectable } from '@nestjs/common';
import { GameState, MoveResponse } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds, lookAheadForOpponent } from './utils';
import { FoodService } from './food.service';
import { AttackService } from './attack.service';

@Injectable()
export class DefaultService {
  initialMoves: Move[] = [
    Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT
  ];

  constructor(private foodService: FoodService,
              private attackService: AttackService,
            ) {}

  public getBasicAvailableMoves(gameState: GameState): Move[] {
    let availableMoves = this.avoidSelf(gameState, this.initialMoves);
    availableMoves = this.avoidOutOfBounds(gameState, availableMoves);
    availableMoves = this.avoidOpponents(gameState, availableMoves);

    return availableMoves;
  }

  private avoidOutOfBounds(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves = [];
    let notSafeMoves = [];
    const myHead = gameState.you.head;

    for (const move of currentSafeMoves) {
      if (coordOutOfBounds(gameState, nextCoordAfterMove({ move: move }, myHead))) {
        notSafeMoves.push(move);
      }
    }

    safeMoves = currentSafeMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
  }

  private avoidSelf(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves = [];
    let notSafeMoves = [];
    const myHead = gameState.you.head;
    const myBody = gameState.you.body;

    for (const move of currentSafeMoves) {
      if (myBody.includes(nextCoordAfterMove({ move: move }, myHead))) {
        notSafeMoves.push(move);
      }
    }

    safeMoves = currentSafeMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
  }

  private avoidOpponents(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves = [];
    const myHead = gameState.you.head;
    for (const move of currentSafeMoves) {
      if (!coordHasOpponent(gameState, nextCoordAfterMove({ move: move }, myHead))) {
        safeMoves.push(move);
      }
    };
    return safeMoves;
  }

  private getDefaultSuggestedMove(suggestedForFood: Move[], suggestedForAttack: Move[]): Move {
    let commonMoves = suggestedForAttack.filter(value => {suggestedForFood.includes(value)});
    
    if (commonMoves.length > 0) {
      console.log("Taking first common move");
      return commonMoves[0];
    }
    if (suggestedForAttack.length > 0) {
      console.log("Taking first attack move");
      return suggestedForAttack[0];
    }
    if (suggestedForFood.length > 0) {
      console.log("Taking first food move");
      return suggestedForFood[0];
    }

    //Default move
    console.log("defaulting move to down");
    return Move.DOWN;
  }



  public defaultStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.getBasicAvailableMoves(gameState);

    // Are there any safe moves left?
    if (availableMoves.length == 0) {
      console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
      return { move: "down" };
    }

    let suggestedMove = availableMoves[0];

    let closestOpponent = this.attackService.findClosestOpponent(gameState);

    let suggestedMovesForFood = this.foodService.moveTowardsClosestFood(gameState, availableMoves);
    let suggestedMovesForAttack = this.attackService.moveTowardsOpponent(gameState, availableMoves, closestOpponent);
    
    let lookAheadForFood = lookAheadForOpponent(gameState, suggestedMovesForFood);
    let lookAheadForAttack = lookAheadForOpponent(gameState, suggestedMovesForAttack);

    suggestedMove = this.getDefaultSuggestedMove(lookAheadForFood, lookAheadForAttack);

    console.log(`MOVE ${gameState.turn}: ${suggestedMove}`)
    return { move: suggestedMove };
  }
}
