import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {ClickHouseService} from './db.service'
import {ClickHouseController} from './db.controller'

//module for clickhouse db
@Module({
    imports: [ConfigModule],
    controllers: [ClickHouseController],
    providers:[
        ClickHouseService,
        {
            provide:'CLICKHOUSE_CONFIG',
            useFactory:(configService:ConfigService)=>({
                host:configService.get<string>('CLICKHOUSE_HOST'),
                username:configService.get<string>('CLICKHOUSE_USR'),
                password:configService.get<string>('CLICKHOUSE_PWD'),
            }),
            inject:[ConfigService],
        },
    ],
    exports:[ClickHouseService,'CLICKHOUSE_CONFIG'],
})
export class ClickHouseModule {
}
