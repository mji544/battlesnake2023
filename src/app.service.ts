import { Injectable } from '@nestjs/common';
import { GameState, InfoResponse, MoveResponse } from './types';
import { StrategyService } from './strategy.service';

@Injectable()
export class AppService {
  constructor(private strategyService: StrategyService) {}

  public initialInfo() : InfoResponse {
    console.log("INFO");

    return {
      apiversion: "1",
      author: "Snake Destroyer",
      color: "#4287f5",
      head: "replit-mark",
      tail: "mlh-gene",
    };
  }
  
  attackStrategy(gameState: GameState): MoveResponse {
    return this.strategyService.attackStrategy(gameState);
  }

  foodStrategy(gameState: GameState): MoveResponse {
    return this.strategyService.foodStrategy(gameState);
  }

  defaultStrategy(gameState: GameState): MoveResponse {
    return this.strategyService.defaultStrategy(gameState);
  }
}
