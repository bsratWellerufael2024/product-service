import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitCoversion } from 'src/entities/unitConversion.entity';

@Injectable()
export class UnitConversionService implements OnModuleInit {
  constructor(
    @InjectRepository(UnitCoversion)
    private unitConversionRepository: Repository<UnitCoversion>,
  ) {}
  private defaultConversions: {
    baseUnit: string;
    containerUnit: string;
    conversionRate: number;
  }[] = [
    { baseUnit: 'pcs', containerUnit: 'carton', conversionRate: 12 },
    { baseUnit: 'gram', containerUnit: 'kg', conversionRate: 1000},
    { baseUnit: 'liters', containerUnit: 'drum', conversionRate: 20 },
    { baseUnit: 'grams', containerUnit: 'kg', conversionRate: 1000 },
  ];

  async onModuleInit() {
    await this.loadDefaultConversions();
  }

  async loadDefaultConversions() {
    for (const conversion of this.defaultConversions) {
      const existing = await this.unitConversionRepository.findOne({
        where: {
          baseUnit: conversion.baseUnit,
          containerUnit: conversion.containerUnit,
        },
      });

      if (!existing) {
        const newConversion = this.unitConversionRepository.create({
          ...conversion,
          isUserDefined: false, // Mark it as a default
        });
        await this.unitConversionRepository.save(newConversion);
      }
    }
  }
  async getSuggestions(baseUnit: string) {
    const suggestions = await this.unitConversionRepository.find({
      where: { baseUnit },
    });
    return {
      success: true,
      message: `Suggested conversions for '${baseUnit}'`,
      data: suggestions,
    };
  }
  async addOrUpdateConversion(
    baseUnit: string,
    containerUnit: string,
    conversionRate: number,
  ) {
    let conversion = await this.unitConversionRepository.findOne({
      where: { baseUnit, containerUnit },
    });

    if (conversion) {
      conversion.conversionRate = conversionRate;
      conversion.isUserDefined = true; // Mark as user-defined
    } else {
      conversion = this.unitConversionRepository.create({
        baseUnit,
        containerUnit,
        conversionRate,
        isUserDefined: true,
      });
    }
    await this.unitConversionRepository.save(conversion);
    return {
      success: true,
      message: 'Conversion rate updated',
      data: conversion,
    };
  }
}

