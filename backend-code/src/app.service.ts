import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  mySuperLongProcessOfUser(data: any):Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`done processing`);
        resolve();
      }, 30000);
    });
  }
  
}
