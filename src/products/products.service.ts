import { BadRequestException, Inject, Injectable, NotAcceptableException, forwardRef } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productReposintory: Repository<ProductEntity>,
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,

    @InjectDataSource()
    private readonly dataSource: DataSource, // ✅ вот это нужно
  ) {}

  async create(createProductDto: CreateProductDto,currentUser:UserEntity):Promise<ProductEntity> {
    const category=await this.categoryService.findOne(+createProductDto.categoryId,);
    const product=this.productReposintory.create(createProductDto);
    product.category=category;
    product.addedBy=currentUser;
    return await this.productReposintory.save(product)
  }

  async findAll(query:any):Promise<{products:any[],totalProducts,limit}> {
    let filteredTotalProducts:number;
    let limit:number;
    
    if(!query.limit){
      limit=4;
    }else{
      limit=query.limit;
    }

    const queryBuilder=this.dataSource
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category','category')
      .leftJoin('product.reviews','review')
      .addSelect([
        'COUNT(review.id) AS reviewCount',
        'AVG(review.ratings)::numeric(10,2) AS avgRating',
      ])
      .groupBy('product.id,category.id');

    const totalProducts=await queryBuilder.getCount();

    if(query.search){
      const search=query.search;
      queryBuilder.andWhere('product.title like :title',{
        title: `%${search}%`
      });
    }

    if(query.category){
      queryBuilder.andWhere('category.id=:id',{id:query.category})
    }

    if(query.minPrice){
      queryBuilder.andWhere("product.price>=:minPrice",{
        minPrice:query.minPrice
      });
    }
    if(query.maxPrice){
      queryBuilder.andWhere("product.price<=:maxPrice",{
        maxPrice:query.maxPrice
      });
    }

    if(query.minRating){
      queryBuilder.andHaving("AVG(review.ratings)>=:minRating",{minRating:query.minRating})
    }
    if(query.maxRating){
      queryBuilder.andHaving("AVG(review.ratings)<=:maxRating",{maxRating:query.maxRating})
    }

    queryBuilder.limit(limit);

    if(query.offset){
      queryBuilder.offset(query.offset);
    }

    const products=await queryBuilder.getRawMany();
    
    return {products,totalProducts,limit};
  }

  async findOne(id: number) {
    const product= await this.productReposintory.findOne({
      where:{id:id},
      relations:{
        addedBy:true,
        category:true,
      },
      select:{
        addedBy:{
          id:true,
          name:true,
          email:true,
        },
        category:{
          id:true,
          title:true,
        }
      }
    });
    if(!product) throw new NotAcceptableException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto:Partial <UpdateProductDto>,currentUser:UserEntity,):Promise<ProductEntity> {
    const product=await this.findOne(id);
    Object.assign(product,updateProductDto)
    product.addedBy=currentUser;
    if(updateProductDto.categoryId){
      const category = await this.categoryService.findOne(
        +updateProductDto.categoryId,
      );
      product.category=category;
    }
    return await this.productReposintory.save(product);
  }

  async remove(id: number) {
    const product=await this.findOne(id);
  const order=await this.orderService.findOneByProductId(product.id);
  if(order)throw new BadRequestException('Products is in use.')
    
    return await this.productReposintory.remove(product);
  }

  async updateStock(id:number,stock:number,status:string){
    let product=await this.findOne(id);
    if(status===OrderStatus.DELIVERED){
      product.stock-=stock;
    }else{
      product.stock+=stock;
    }
    product=await this.productReposintory.save(product);
    return product;
  }

  async getRecommended(): Promise<ProductEntity[]> {
    const topCategoryIds = (await this.getTopOrderedCategoryIds())
      .filter(id => !isNaN(id))
      .slice(0, 5); // топ-5 категорий
  
    const allProducts: ProductEntity[] = [];
  
    for (const categoryId of topCategoryIds) {
      const rawProducts = await this.productReposintory
        .createQueryBuilder('product')
        .leftJoin('product.category', 'category')
        .where('category.id = :categoryId', { categoryId })
        .orderBy('RANDOM()') // случайный порядок
        .limit(10) // берем 10 товаров
        .getMany(); // не .getRawMany() — чтобы избежать проблем с DISTINCT
  
      allProducts.push(...rawProducts);
    }
  
    // Загружаем категории отдельно
    return this.productReposintory.find({
      where: { id: In(allProducts.map(p => p.id)) },
      relations: ['category'],
    });
  }
  
  
  private async getTopOrderedCategoryIds(): Promise<number[]> {
    const result = await this.dataSource
      .getRepository('orders_products')
      .createQueryBuilder('op')
      .leftJoin('op.product', 'product')
      .leftJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('COUNT(*)', 'orderCount')
      .groupBy('category.id')
      .orderBy('COUNT(*)', 'DESC') // ✅ используем агрегат напрямую
      .getRawMany();
  
    // Возвращаем массив чисел
    return result.map(row => Number(row.categoryId)).filter(id => !isNaN(id)); // Ensure valid categoryIds
  }
  
  
}
