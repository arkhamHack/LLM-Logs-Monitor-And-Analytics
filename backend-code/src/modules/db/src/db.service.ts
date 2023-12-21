import axios from 'axios';
import { Injectable, Inject } from '@nestjs/common';
import { createClient, ClickHouseClient, InputJSONObjectEachRow } from '@clickhouse/client';
import { FilterCondition, AggregateCondition } from './type';
import { DBData } from 'src/modules/dashboard/src/type';

@Injectable()
export class ClickHouseService {
  private readonly clickhouse: ClickHouseClient;
  private tableName: string = 'logs_metrics_monitor';
  constructor(@Inject('CLICKHOUSE_CONFIG') private readonly clickHouseConfig: any) {
    this.clickhouse = createClient({
      host: this.clickHouseConfig.host,
      password: this.clickHouseConfig.password,
    });
  }
  setTableName(tableName: string): void {
    this.tableName = tableName;
  }

//function to insert into clickhouse
  async insertRecord(data: DBData): Promise<void> {
    await this.clickhouse.insert({ table: this.tableName, values: [data], format: 'JSONEachRow' });
  }

  //function to prepare query for clickhouse querying

  private prepareQuery(conditions: FilterCondition[], connectors?: string[]): string {
    let dashboardConditions = '';
    if (Array.isArray(conditions) && conditions.length > 0) {
      let conditionAltered = "";
      if (conditions.length == 1) {
        const condition = conditions[0];
        if (condition.operation === 'null' || condition.operation === 'not null' || condition.operation === 'is null') {
          dashboardConditions = `${condition.field} ${condition.operation}`;
        } else {

          conditionAltered = typeof condition.value === 'string'
            ? `'${condition.value}'`
            : condition.value;
        }
        dashboardConditions = `${condition.field} ${condition.operation} ${conditionAltered}`
      }
      else {
        dashboardConditions = conditions.map((condition, index) => {
          const connector = connectors[index] || '';
          if (
            condition.operation === 'null' ||
            condition.operation === 'not null' ||
            condition.operation === 'is null'
          ) {
            return `${condition.field} ${condition.operation} ${connector}`;
          } else {

            conditionAltered = typeof condition.value === 'string'
              ? `'${condition.value}'`
              : condition.value;

            return `${condition.field} ${condition.operation} ${conditionAltered} ${connector}`;
          }
        }
        ).join(' ');
      }
      return 'WHERE ' + dashboardConditions;
    } else {
      return ''
    }
  }

  //function to fetch data from clickhouse based on filter
  async filterRecords(conditions: FilterCondition[], connectors?: string[]): Promise<any[]> {
    const dashboardConditions = this.prepareQuery(conditions, connectors);
    const query = `SELECT * FROM ${this.tableName} ${dashboardConditions} ORDER BY created_at`.trim();
    const result = await this.clickhouse.query({ query: query, format: 'JSONEachRow' });
    return result.json();
  }

//function to get both aggregate values based on filters applied and the filtered data dynamically
  async calculateAggregates(aggConditions: AggregateCondition[], conditions: FilterCondition[], connectors?: string[]): Promise<any> {
    const whereClause = this.prepareQuery(conditions, connectors);
    const aggregateClauses = aggConditions.map((aggCondition) => {
      if (aggCondition.aggregateFunction.toLowerCase() === 'quantile') {
        const quantileValue = aggCondition.aggVal;
        return `${aggCondition.aggregateFunction}(${quantileValue})(${aggCondition.field}) AS ${aggCondition.field}_${aggCondition.aggregateFunction}_${quantileValue * 100}`;
      } else if (aggCondition.aggregateFunction.toLowerCase() === 'countif') {
        const countConditionVal = aggCondition.aggVal;
        let alias = "";
        if (countConditionVal && countConditionVal.includes('!='))
          alias = "failure_count"
        else
          alias = "success_count";
        return `${aggCondition.aggregateFunction}(${aggCondition.field} ${countConditionVal}) AS ${alias}`;

      } else {
        return `${aggCondition.aggregateFunction}(${aggCondition.field}) AS ${aggCondition.field}_${aggCondition.aggregateFunction}`;
      }
    });
    const aggregateQuery = aggregateClauses.join(', ');

    const query = `SELECT ${aggregateQuery} FROM ${this.tableName} ${whereClause}`;
    try {
      const filteredRes = await (await this.clickhouse.query({ query: `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY created_at`.trim(), format: 'JSONEachRow' })).json();
      const metricResult = await (await this.clickhouse.query({ query: query, format: 'JSONEachRow' })).json();
      const countByDateQueryRes = await (await this.clickhouse.query({ query: `SELECT toStartOfDay(created_at) AS day,COUNT(*) AS requests_per_day FROM  ${this.tableName} ${whereClause} GROUP BY day ORDER BY day`, format: 'JSONEachRow' })).json();
      return { filteredRes, metricResult, countByDateQueryRes };

    }
    catch (error) {
      throw new Error(`error.aggregate-filter-calc-issue: ${error}`)
    }
  }

  //fetch all columns from my table in clickhouse
  async fetchAllColumns(): Promise<any[]> {
    const sqlQuery = `SELECT name FROM system.columns WHERE table = '${this.tableName}'`;
    const result = await this.clickhouse.query({ query: sqlQuery });
    return result.json();
  }

  //fetch all the data from the table in clickhouse
  async fetchAllRows(): Promise<any[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at`
    const result = await this.clickhouse.query({ query: query, format: 'JSONEachRow' });
    return result.json();
  }

  //function to fetch data in date range for analytics
  async fetchDataInRange(fieldname: string, timePeriod: string): Promise<any[]> {
    const currentTime = new Date();
    let startTime;

    switch (timePeriod) {
      case '5mins':
        startTime = new Date(currentTime.getTime() - 5 * 60 * 1000);
        break;
      case '30mins':
        startTime = new Date(currentTime.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        startTime = new Date(currentTime.getTime() - 60 * 60 * 1000);
        break;
      case '6hours':
        startTime = new Date(currentTime.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '1day':
        startTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '2days':
        startTime = new Date(currentTime.getTime() - 2 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startTime = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        throw new Error('Invalid time period');
    }
    const formattedStartTime = startTime.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
    const formattedCurrentTime = currentTime.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];

    const query = `
    SELECT created_at, ${fieldname}
    FROM ${this.tableName}
    WHERE toDateTime(created_at) >= toDateTime('${formattedStartTime}') 
      AND toDateTime(created_at) <= toDateTime('${formattedCurrentTime}')
    ORDER BY created_at;
  `;
    const result = await this.clickhouse.query({ query, format: 'JSONEachRow' });
    return result.json();
  }
}

