// // rabbitmq.module.ts
// import { Module } from "@nestjs/common";
// import { Client, ClientProxyFactory,Transport } from "@nestjs/microservices";
// import { RabbitMQService } from "./rabbit.service";
// // import { RabbitListener } from "./rabbit.listener";
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({
//   imports: [ConfigModule],
//       providers: [
//         RabbitMQService,
//         {
//           provide: 'RABBITMQ_CLIENT',
//           useFactory: (configService: ConfigService) => {
//             return ClientProxyFactory.create({
//               transport: Transport.RMQ,
//               options: {
//                 urls: [configService.get<string>('RABBITMQ_URLS')],
//                 queue: configService.get<string>('RABBITMQ_QUEUE'),
//                 queueOptions:{
//                   durable:false
//                 },
//               },
//             });
//           },
//           inject: [ConfigService],
//         },
//       ],
//       exports: ['RABBITMQ_CLIENT', RabbitMQService],
    
// })
// export class RabbitMQModule {}
