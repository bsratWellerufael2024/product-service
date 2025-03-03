import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  specification?: string;

  @IsOptional()
  @IsString()
  baseUnit?: string;

  @IsOptional()
  @IsNumber()
  cost_price?: number;

  @IsOptional()
  @IsNumber()
  selling_price?: number;

  @IsOptional()
  @IsNumber()
  openingQty?: number;
}
