// // rabbitmq.service.ts
// import { Injectable,Inject, OnApplicationBootstrap } from '@nestjs/common';
// import { ClientProxy, ClientProxyFactory,Transport } from '@nestjs/microservices';
// import { ConfigService } from '@nestjs/config'; // Import ConfigService for access to configuration

// @Injectable()
// export class RabbitMQService implements  OnApplicationBootstrap {
//   constructor(@Inject('RABBITMQ_CLIENT')private readonly rabbitMQClient: ClientProxy) {  }

//   async publishToQueue(pattern:string,data:any): Promise<void> {
//     console.log(pattern)
//     return this.rabbitMQClient.emit(pattern,data).toPromise();
//   }
//   async onApplicationBootstrap() {
//     await this.rabbitMQClient.connect();
// }
// }
