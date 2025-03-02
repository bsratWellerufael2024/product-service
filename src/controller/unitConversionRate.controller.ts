import { Controller } from "@nestjs/common";
import { UnitConversionService } from "src/service/unitConversion.service";
import { MessagePattern } from "@nestjs/microservices";
@Controller()
export class UnitConversionController {
  constructor(private unitConversion: UnitConversionService) {}

  @MessagePattern('get-suggestion')
   getSuggestion(data:any){
     return this.unitConversion.getSuggestions(data)
   }
   
  @MessagePattern('update-rate')
  createProduct(body: any) {
    return this.unitConversion.addOrUpdateConversion(
      body.baseUnit,
      body.containerUnit,
      body.conversionRate,
    );
  }
}