import {Controller,Post,Body,Get,Query,Param} from '@nestjs/common'
import { ClickHouseService } from './db.service'
import { FilterCondition,AggregateCondition } from './type';

@Controller('clickhouse')

export class ClickHouseController{
    constructor(private readonly clickHouseService: ClickHouseService){}

    //endpoint for filtered results 
    @Get(':table/filter')
    async fetchConditionalRecords(@Param('table') tableName:string,@Query('conditions')conditions:string,@Query('connectors') connectorsParam: string,){
        const condition:FilterCondition[]=JSON.parse(conditions)
        const connector: string[] = JSON.parse(connectorsParam) || [];
        this.clickHouseService.setTableName(tableName);
        const res= await this.clickHouseService.filterRecords(condition,connector)
         return res
    }

    //endpoint to get aggregate metrics
    @Get(':table/aggregates')
    async aggregateMetricsFetch(@Param('table')tableName:string,@Query('agg_conditions')agg_conditions:string,@Query('conditions')conditions:string,@Query('connectors') connectorsParam: string)
{   
    const aggCondition:AggregateCondition[]=JSON.parse(agg_conditions)||[];
    const filteredValCondition:FilterCondition[]=JSON.parse(conditions)||[];
    const connector: string[] = JSON.parse(connectorsParam) || [];
    this.clickHouseService.setTableName(tableName);
    return await this.clickHouseService.calculateAggregates(aggCondition,filteredValCondition,connector)
}

//endpoint to get columns of table
@Get(':table/columns')
async fetchColumns(@Param('table')tableName:string){
    this.clickHouseService.setTableName(tableName);
    return this.clickHouseService.fetchAllColumns();
}


@Get(':table/fetch_all_fields')
async fetchAllFields(@Param('table')tableName:string){
    this.clickHouseService.setTableName(tableName);
    return this.clickHouseService.fetchAllRows();
}


//endpoint to get data within a date range
@Get(':table/fetch_range_data')
async fetchRangeData(@Param('table')tableName:string,@Query('field_name')field:string,@Query('date_range')date_range:string){
    this.clickHouseService.setTableName(tableName);
    return this.clickHouseService.fetchDataInRange(field,date_range);
}


}