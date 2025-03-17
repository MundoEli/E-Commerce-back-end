import { Type } from "class-transformer";
import { CreateShippingDto } from "./create-shipping.dto";
import { ValidateNested } from "class-validator";
import { CreateCategoryDto } from "src/categories/dto/create-category.dto";
import { OrderedProductsDto } from "./ordered-products.dto";

export class CreateOrderDto {
    @Type(()=>CreateShippingDto)
    @ValidateNested()
    shippingAddress:CreateCategoryDto;
    @Type(()=>OrderedProductsDto)
    @ValidateNested()
    orderedProducts:OrderedProductsDto[];    
}
