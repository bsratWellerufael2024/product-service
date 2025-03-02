import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './service/product.service';
import { Products } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { UnitCoversion } from './entities/unitConversion.entity';
import { ProductVariant } from './entities/variant.entity';
import { ProductController } from './controller/product.controller';
import { CategoryService } from './service/category.service';
// import { UnitConversionService } from './service/unitConversion.service';
import { UnitConversionService } from './service/unitConversion.service';
import { CategoryController } from './controller/category.controller';
import { UnitConversionController } from './controller/unitConversionRate.controller';
import { VariantController } from './controller/variant.controller';
import { ProductVariantService } from './service/variant.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Products,
      Category,
      UnitCoversion,
      ProductVariant,
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as any,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Products, Category, UnitCoversion, ProductVariant],
        synchronize: true,
        logging: false,
        //migrations: ['src/migrations/*.ts'],
      }),
    }),
  ],
  controllers: [
    AppController,
    ProductController,
    CategoryController,
    UnitConversionController,
    VariantController,
  ],
  providers: [
    AppService,
    ProductService,
    CategoryService,
    UnitConversionService,
    ProductVariantService,
  ],
})
export class AppModule {}
