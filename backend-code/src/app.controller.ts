import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern,MessagePattern,Payload,Ctx,RmqContext } from '@nestjs/microservices';
import { OpenAiService } from './modules/openai/src/openai.service';
import { DashboardService } from './modules/dashboard/src/dashboard.service';

@Controller()
export class AppController {
  constructor(private readonly openAiService: OpenAiService,private readonly appService: AppService,private readonly dashboardService: DashboardService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @EventPattern('user-input')
  public async execute(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const orginalMessage = context.getMessage();

    console.log('data', data);
    await this.openAiService.processData(data);

    channel.ack(orginalMessage);
  }
  // @EventPattern('process_and_insert')
  // async processAndInsertHandler(@Payload() combined_data: any, @Ctx() context: RmqContext ): Promise<void> {
  //   await this.dashboardService.processAndInsertData(combined_data);
  //       const channel = context.getChannelRef();
  //   const orginalMessage = context.getMessage();

  //   await this.appService.mySuperLongProcessOfUser(combined_data);

  // }

  
  // @EventPattern('event_stream')
  // async evenStreamer(@Payload() data: any, @Ctx() context: RmqContext):Promise<void>{
  //   await this.dashboardService.setUpEvents(data);
  //   const channel = context.getChannelRef();
  //   const orginalMessage = context.getMessage();

  //   await this.appService.mySuperLongProcessOfUser(data);
  //   channel.ack(orginalMessage);
  // }

}
