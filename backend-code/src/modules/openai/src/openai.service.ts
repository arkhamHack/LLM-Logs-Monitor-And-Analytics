import { Injectable,Inject} from '@nestjs/common';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { UserInput } from '../../dashboard/src/type';
import { DashboardService } from '../../dashboard/src/dashboard.service';
// import {RabbitMQService} from '../../../rabbitmq/src/rabbit.service'
@Injectable()
export class OpenAiService{
  private readonly dashboardService:DashboardService
  private readonly openAiApiUrl:string='https://api.openai.com/v1/chat/completions';
    constructor(  
    
      @Inject('OPEN_AI_CONFIG')private readonly openAiConfig:any){

    }
    
//function to send input to openai
    async processData(data: UserInput): Promise<any> {
          try{
              const toSendOpenAi ={
          
                  "model":data.model,
                      "messages": [
                    {
                      "role": "system",
                      "content": "You are a helpful assistant."
                    },
                    {
                      "role": "user",
                      "content": data.prompt
                    }
                  ],                
          }
          let apiKeyToUse="";
          if(data.api_key){
            apiKeyToUse=data.api_key
          }
          else{
            apiKeyToUse= this.openAiConfig.api_key
          }
              const response:AxiosResponse<any>=await axios.post(
                  `${this.openAiApiUrl}`,toSendOpenAi,
                  {
                      headers:{
                          'Authorization':`Bearer ${apiKeyToUse}`,
                          'Content-Type':'application/json'
                      },
                  },
              );
              if (response.status!==200){
                  throw new Error(`OpenAI API responded with status ${response.status}`)
              }
              
              return response.data;
          }
          catch(error){
            if (axios.isAxiosError(error)){
              const axiosError = error as AxiosError;
              if (axiosError.response) {
                  console.error('OpenAI API Error:', axiosError.response.status, axiosError.response.data);
                  this.dashboardService.openAiRes=`Status: ${axiosError.response.status} Error:`
                  console.log(this.dashboardService.openAiRes)
                } else if (axiosError.request) {
                  console.error('OpenAI API No Response:', axiosError.request);
                } else {
                  console.error('OpenAI API Request Setup Error:', axiosError.message);
                }
            }
            else{
              throw error;
            }
            throw error;
          }
      }
  }