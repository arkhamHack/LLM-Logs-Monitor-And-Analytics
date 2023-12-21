export interface UserInput{
    prompt:string;
    model:string;
    user_id:string;
    api_key?:string;
}

export interface DBData {
    event_id: string;
    created_at: Date;             
    user_id: string;              
    model: string;                
    prompt: string;
    response?: string;
    input_token: number;          
    output_token: number;         
    status_code: string;      
    completion_status: boolean;    
    cost: number;
    latency:number;                
  }

  export interface PricingMap {
    [modelName: string]: {
      inputPrice: number;
      outputPrice: number;
    };
  }

  export interface CombinedData {
    user_data:UserInput,
    open_ai_data:any;
  }