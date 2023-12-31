import { Injectable } from '@nestjs/common';
import { GameState, MoveResponse } from './types';
import { lookAheadForOpponent, lookAheadForOpponentAndFood } from './utils';
import { FoodService } from './food.service';
import { AttackService } from './attack.service';
import { DefaultService } from './default.service';

@Injectable()
export class StrategyService {
  constructor(private foodService: FoodService,
              private attackService: AttackService,
              private defaultService: DefaultService,
            ) {}


  public defaultStrategy(gameState: GameState): MoveResponse {
    const availableMoves = this.defaultService.getBasicAvailableMoves(gameState);

    // Are there any safe moves left?
    if (availableMoves.length == 0) {
      console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
      return { move: "down" };
    }
    // console.log("availableMoves:", availableMoves)

    const closestOpponent = this.attackService.findClosestEdibleOpponent(gameState);

    const suggestedMovesForFood = this.foodService.moveTowardsClosestAvailableFood(gameState, availableMoves);
    const suggestedMovesForAttack = this.attackService.moveTowardsOpponent(gameState, availableMoves, closestOpponent);
    
    // console.log("possible attack/food", suggestedMovesForAttack, suggestedMovesForFood)

    const lookAheadForFood = lookAheadForOpponentAndFood(gameState, suggestedMovesForFood);
    const lookAheadForAttack = lookAheadForOpponent(gameState, suggestedMovesForAttack);
    const lookAheadForConservative = this.foodService.lookAheadConservative(gameState, availableMoves);

    // console.log("lookahead attack/food", lookAheadForAttack, lookAheadForFood)
    // const suggestedMove = this.defaultService.getDefaultSuggestedMove(gameState, lookAheadForFood, lookAheadForAttack, lookAheadForConservative, closestOpponent);
    const suggestedMove = this.defaultService.getWeightedSuggestedMove(gameState, lookAheadForFood, lookAheadForAttack, lookAheadForConservative, closestOpponent);

    console.log(`MOVE ${gameState.turn}: ${suggestedMove}`)
    return { move: suggestedMove };
  }

  public attackStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);
    return { move: availableMoves[0] };
  }

  public foodStrategy(gameState: GameState): MoveResponse {
    let availableMoves = this.defaultService.getBasicAvailableMoves(gameState);

    // Ideas:
    // See if other opponents are going to eat a food and grow
    // Check to see if not, then can move to follow the tail
    let suggestedMove = this.foodService.lookAheadConservative(gameState, availableMoves);

    return { move: suggestedMove[1] };
  }
}
