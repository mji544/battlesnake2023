import { Injectable } from '@nestjs/common';
import { Battlesnake, GameState } from './types';
import { Move, coordHasOpponent, nextCoordAfterMove, coordOutOfBounds } from './utils';

@Injectable()
export class DefaultService {
  initialMoves: Move[] = [
    Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT
  ];

  constructor() {}

  public getDefaultSuggestedMove(gameState: GameState, suggestedForFood: Move[], suggestedForAttack: Move[], closestOpponent: Battlesnake): Move {
    let commonMoves = suggestedForAttack.filter(value => suggestedForFood.includes(value));
    console.log("common moves: " + commonMoves)
    
    if (commonMoves.length > 0) {
      console.log("Taking first common move");
      return commonMoves[0];
    }
    if (suggestedForAttack.length > 0 && closestOpponent.length < gameState.you.length) {
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


  public getBasicAvailableMoves(gameState: GameState): Move[] {
    let availableMoves = this.avoidSelf(gameState, this.initialMoves);
    console.log(availableMoves)
    availableMoves = this.avoidOutOfBounds(gameState, availableMoves);
    console.log(availableMoves)
    availableMoves = this.avoidOpponents(gameState, availableMoves);
    console.log(availableMoves)


    return availableMoves;
  }

  private avoidOutOfBounds(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves: Move[] = [];
    let notSafeMoves: Move[] = [];
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
    let safeMoves: Move[] = [];
    let notSafeMoves: Move[] = [];
    const myHead = gameState.you.head;
    const myNeck = gameState.you.body[1];
    const myBody = gameState.you.body;

    for (const move of currentSafeMoves) {
      const nextCoord = nextCoordAfterMove({ move: move }, myHead);
      for (const coord of myBody) {
        if (nextCoord === coord) {
          console.log("HEREEE")
        }
      }

      console.log("something", myBody.indexOf(nextCoordAfterMove({ move: move }, myHead)), myBody.some(point => point === nextCoordAfterMove({ move: move }, myHead)), myBody.find(point => point === nextCoordAfterMove({ move: move }, myHead)), myBody.findIndex(point => point === nextCoordAfterMove({ move: move }, myHead)))
      if (myBody.includes(nextCoordAfterMove({ move: move }, myHead)) || nextCoordAfterMove({ move: move }, myHead) === myNeck) {
        notSafeMoves.push(move);
      }
    }

    safeMoves = currentSafeMoves.filter(move => !notSafeMoves.includes(move));
    return safeMoves;
  }

  private avoidOpponents(gameState: GameState, currentSafeMoves: Move[]): Move[] {
    let safeMoves: Move[] = [];
    const myHead = gameState.you.head;
    for (const move of currentSafeMoves) {
      if (!coordHasOpponent(gameState, nextCoordAfterMove({ move: move }, myHead))) {
        safeMoves.push(move);
      }
    };
    return safeMoves;
  }

}
