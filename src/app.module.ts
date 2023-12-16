import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FoodService } from './food.service';
import { AttackService } from './attack.service';
import { DefaultService } from './default.service';
import { StrategyService } from './strategy.service';
import { BoardService } from './board.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, 
              FoodService, 
              AttackService, 
              DefaultService,
              StrategyService,
              BoardService],
})
export class AppModule {}
