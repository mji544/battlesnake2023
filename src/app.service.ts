import { Injectable } from '@nestjs/common';
import { GameState, InfoResponse, MoveResponse } from './types';
import { AttackService } from './attack.service';
import { FoodService } from './food.service';
import { DefaultService } from './default.service';

@Injectable()
export class AppService {
  constructor(private attackService: AttackService,
    private foodService: FoodService,
    private defaultService: DefaultService) {}

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
    return {move: "down"};
  }

  defaultStrategy(gameState: GameState): MoveResponse {
    return {move: "down"};
  }
}
