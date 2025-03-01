import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Transport,MicroserviceOptions} from '@nestjs/microservices'

async function bootstrap() {
  const app=await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport:Transport.REDIS,
    options:{
        host:'127.0.0.1',
        port:6379
    }
  })
  await app.listen().then(()=>{
    console.log('Product service is running on port 300');
  })
}
bootstrap();
