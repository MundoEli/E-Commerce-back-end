import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty({message:'title can not be blank'})
    @IsString()
    title:string;

    @IsNotEmpty({message:'description can not be empty'})
    @IsString()
    description:string;

    @IsNotEmpty({message:'price can not be empty'})
    @IsNumber(
        {maxDecimalPlaces:2},
        {message:'price should be number & max decimal precission 2'},     
    )
    @IsPositive({message:'price should be positive number'})
    price:number;

    @IsNotEmpty({message:'stock can not be empty'})
    @IsNumber({},{message:'stock should be number'})
    @Min(0,{message:'stock can not be negative'})
    stock:number;

    @IsNotEmpty({message:'images can not be empty'})
    @IsArray({message:'images should be in array format'})
    images:string[];

    @IsNotEmpty({message:'category can not be empty'})
    @IsNumber({},{message:'category should be number'})
    categoryId:number;
}
