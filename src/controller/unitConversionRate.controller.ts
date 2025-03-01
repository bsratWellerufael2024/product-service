import { Controller } from "@nestjs/common";
import { UnitConversionService } from "src/service/unitConversion.service";
import { MessagePattern } from "@nestjs/microservices";
@Controller()
export class UnitConversionController{
    constructor(private unitConversion:UnitConversionService){}
    @MessagePattern('unit-created')
      createProduct(unitData: any) {
        return this.unitConversion.unitCoversion(unitData);
      }
}