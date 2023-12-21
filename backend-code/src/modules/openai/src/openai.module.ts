import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {OpenAiService} from './openai.service'
import { DashboardService } from 'src/modules/dashboard/src/dashboard.service';

//module for open ai service

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal:true,
        }),
    ],
    controllers: [],
    providers:[
        OpenAiService,
        {
            provide:'OPEN_AI_CONFIG',
            useFactory:(configService:ConfigService)=>({
                api_key:configService.get<string>('OPEN_AI_API_KEY'),
            }),
            inject:[ConfigService],
        },
    ],
    exports:[OpenAiService,'OPEN_AI_CONFIG'],
})
export class OpenAiModule {}
