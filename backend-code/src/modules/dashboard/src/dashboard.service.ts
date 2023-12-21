
import { Injectable,MessageEvent } from '@nestjs/common';
import { ClickHouseService } from '../../db/src/db.service';
import { OpenAiService } from '../../openai/src/openai.service';
import { UserInput, DBData,CombinedData} from './type';
import { modelPricing } from './pricingMap';
import { Subject, Observable,BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {
    private startTime: number
    openAiRes:any=null;
    constructor(
        private readonly clickHouseService: ClickHouseService,
        private readonly openAiService: OpenAiService
    ) { }
    eventsSubject = new BehaviorSubject<MessageEvent>({data:null});
    private events:Observable<MessageEvent> =this.eventsSubject.asObservable();
  
    initiateLatencyCalculation(): void {
        this.startTime = performance.now();
    }
    private async prepareData(openAiData: any, origData: UserInput): Promise<DBData> {
        const {
            id,
            created,
            model,
            choices: [{ message }],
        } = openAiData;
        this.openAiRes=openAiData.choices[0]?.message?.content;
        const modelPrice = modelPricing[model];
        if (!modelPrice) {
            throw new Error(`Pricing not available for model: ${model}`);
        }
        const cost = modelPrice.inputPrice * openAiData.usage.prompt_tokens + modelPrice.outputPrice * openAiData.usage.completion_tokens;
        const latencyCal = (performance.now() - this.startTime) / 1000;
        let compStatus;
        if (openAiData.choices[0].finish_reason == 'stop')
            compStatus = true;
        else
            compStatus = false;

        const event: DBData = {
            event_id: id.split("-")[1] || null,
            created_at: new Date(created * 1000),
            user_id: origData.user_id,
            model: model,
            prompt: origData.prompt,
            response: message.content,
            input_token: openAiData.usage.prompt_tokens,
            output_token: openAiData.usage.completion_tokens,
            status_code: "200",
            completion_status: compStatus,
            latency: latencyCal,
            cost: cost,
        };
        console.log(event)
        return event;
    }
    private generateRandomEventId(): string {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return randomNum.toString();
      }

    async processAndInsertData( inputData:UserInput,tableName:string): Promise<void> {
        try{
        const processedData = await this.openAiService.processData(inputData);
        this.clickHouseService.setTableName(tableName);
        const dataForClickHouse = await this.prepareData(processedData,inputData);
        await this.clickHouseService.insertRecord(dataForClickHouse);
        }
        catch(error){
            console.error('OpenAI API call failed:', error);
            this.openAiRes=`Model:${inputData.model} Invalid or Not Allowed on current Api Key`
            // Set values for ClickHouse record in case of failure
            const dataForClickHouseFailure = {
              event_id: this.generateRandomEventId(), 
              created_at: new Date(),  
              user_id: inputData.user_id,  
              model: inputData.model,  
              prompt: inputData.prompt,  
              response: '', 
              input_token: 0,  
              output_token: 0, 
              status_code: error.response?.status || "500",  
              completion_status: false,
              cost: 0,
              latency:(performance.now() - this.startTime) / 1000,
            };
            await this.clickHouseService.insertRecord(dataForClickHouseFailure);

        }
    }

    async setUpEvents():Promise<Subject<MessageEvent>>{
    this.eventsSubject.next(this.openAiRes||"");
// console.log("Data:",this.eventsSubject)
return this.eventsSubject

    }

    // async getEvents():Promise<Subject<MessageEvent>>{
    //     return this.eventsSubject
    // }

}