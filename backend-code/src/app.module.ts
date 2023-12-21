import { Module } from '@nestjs/common';
import { ClickHouseModule } from './modules/db/src/db.module';
import { DashboardModule } from './modules/dashboard/src/dashboard.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// import { RabbitMQModule } from './modules/rabbitmq/src/rabbit.module';
import { OpenAiService } from './modules/openai/src/openai.service';
import { OpenAiModule } from './modules/openai/src/openai.module';
import { DashboardService } from './modules/dashboard/src/dashboard.service';
@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),ClickHouseModule,OpenAiModule, DashboardModule ],
  controllers: [AppController],
  providers: [AppService,OpenAiService,DashboardService,
  ],
})
export class AppModule {}
