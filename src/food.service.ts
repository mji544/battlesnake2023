import { Injectable } from '@nestjs/common';
import { GameState, InfoResponse, MoveResponse } from './types';

@Injectable()
export class FoodService {
  public foodStrategy(gameState: GameState): MoveResponse {
    return {move: "down"};
  }
}
