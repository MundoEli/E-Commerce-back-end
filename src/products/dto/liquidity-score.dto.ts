import { IsNumber, Min, Max } from 'class-validator';

export class LiquidityScoreDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating: number;

  @IsNumber()
  @Min(0)
  reviewCount: number;

  @IsNumber()
  @Min(0)
  price: number;
}
