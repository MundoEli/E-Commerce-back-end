import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class OrderedProductsDto {
    @IsNotEmpty({message:'Product can not be empty'})
    id:number;
    @IsNumber(
        {maxDecimalPlaces:2},
        {message:'price should be number & max decimal precission 2'},
    )
    @IsPositive({message:'Price can not be negative'})
    product_unit_price:number;
    
    @IsNumber({},{message:'quantity should be number '})
    @IsPositive({message:'quantity can not be negative'})
    product_quantity:number;
}