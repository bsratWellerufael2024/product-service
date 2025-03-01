import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnitCoversion } from "src/entities/unitConversion.entity";
@Injectable()
export class UnitConversionService {
  constructor(
    @InjectRepository(UnitCoversion)
    private unitRepository: Repository<UnitCoversion>,
  ) {}
  async unitCoversion(unitData:{
      baseUnit:string,
      container_unit:string,
      rate:number
  }){
    const newConversion=this.unitRepository.create({
        baseUnit:unitData.baseUnit,
        containerUnit:unitData.container_unit,
        conversionRate:unitData.rate
    })
    return await this.unitRepository.save(newConversion)
  }
}