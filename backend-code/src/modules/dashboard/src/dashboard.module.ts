import {Module} from '@nestjs/common';
import { ClickHouseModule } from '../../db/src/db.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ClickHouseService } from '../../db/src/db.service';
import { OpenAiService } from '../../openai/src/openai.service';
import {OpenAiModule} from  '../../openai/src/openai.module';
// import {RabbitMQService} from '../../rabbitmq/src/rabbit.service'
// import {RabbitMQModule} from '../../rabbitmq/src/rabbit.module'
import {ClientsModule,Transport} from '@nestjs/microservices'
@Module({
    imports:[ClickHouseModule,OpenAiModule],
    controllers:[DashboardController],
    providers: [DashboardService, ClickHouseService, OpenAiService],
})
export class DashboardModule {}