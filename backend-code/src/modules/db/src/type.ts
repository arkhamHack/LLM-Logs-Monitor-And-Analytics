export interface FilterCondition  {
    field: string;
    operation: string;
    value?: any;
  };

  

export interface AggregateCondition{
    field:string;
    aggregateFunction:string;
    aggVal?:any;
}