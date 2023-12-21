import { Sse,Controller, Post, Body, Param,MessageEvent } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {UserInput} from './type'
import { interval, Observable,BehaviorSubject,Observer } from 'rxjs';
import { map , startWith, switchMap } from 'rxjs/operators';
import { MessagePattern } from '@nestjs/microservices';
import { OpenAiService } from '../../openai/src/openai.service';
import { table } from 'console';
// import { RabbitMQService } from '../../rabbitmq/src/rabbit.service';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService,
    // private rabbitMQService:RabbitMQService,
    ) {}

  @Post(':table/process-and-insert')
  async processAndInsertData(@Param('table') tableName: string, @Body() data: UserInput): Promise<void> {
    await this.dashboardService.initiateLatencyCalculation()
    await this.dashboardService.processAndInsertData(data,tableName)
  }

  @Sse('/sse')
  async sse(): Promise<Observable<MessageEvent>> {
    return new Observable((observer: Observer<MessageEvent>) => {
      this.dashboardService.setUpEvents().then(() => {
        const eventData = JSON.stringify(this.dashboardService.eventsSubject.getValue());
        const characters = eventData.split('');
        const interval = setInterval(() => {
          if (characters.length > 0) {
            const character = characters.shift();
            observer.next({ data: character });
          } else {
            observer.complete();
            clearInterval(interval);
          }
        }, 100);
      });
     });
  }

}