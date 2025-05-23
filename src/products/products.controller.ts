import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from './entities/product.entity';
import { query } from 'express';
import { SerializeIncludes, SerializeInterceptor } from 'src/utility/interceptors/serialize.interceptor';
import { ProductsDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthenticationGuard,AuthorizeGuard([Roles.ADMIN]))
  @Post()
  create(@Body() createProductDto: CreateProductDto,@CurrentUser() currentUser:UserEntity):Promise<ProductEntity> {
    return this.productsService.create(createProductDto,currentUser);
  }

  @SerializeIncludes(ProductsDto)
  @Get()
  async findAll(@Query() query:any): Promise<ProductsDto> {
    return this.productsService.findAll(query);
  }

  @Get('recommended')
  getRecommended(): Promise<ProductEntity[]> {
    return this.productsService.getRecommended();
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID');
    }
    return this.productsService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard,AuthorizeGuard([Roles.ADMIN]))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto,@CurrentUser()
  currentUser:UserEntity):Promise<ProductEntity> {
    return await this.productsService.update(+id, updateProductDto,currentUser);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(+id);
  }

  @Post('liquidity')
  checkLiquidity(@Body() body: { averageRating: number; reviewCount: number; price: number; stock: number }) {
    return this.productsService.calculateLiquidityScore(body);
  }


}
