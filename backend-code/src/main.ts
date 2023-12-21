import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Transport} from '@nestjs/microservices'
declare const module:any
async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  // const microservice = app.connectMicroservice({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://username:password@localhost:5672'],
  //     queue: 'rabbitmq_queue',
  //     queueOptions: {
  //       durable: false
  //     },
  //   },
  // });

  // await app.startAllMicroservices();
  app.enableCors();

  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
