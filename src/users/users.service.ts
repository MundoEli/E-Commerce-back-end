import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash,compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign,SignOptions } from 'jsonwebtoken';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async signup(userSignUpDto:UserSignUpDto):Promise<Omit<UserEntity, 'password'>>{
    const userExists=await this.findUserByEmail(userSignUpDto.email)
    if(userExists) throw new BadRequestException('Email is not available')
    userSignUpDto.password= await hash(userSignUpDto.password,10)
    let user=this.usersRepository.create(userSignUpDto);
    user= await this.usersRepository.save(user)
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async signin(userSignInDto:UserSignInDto): Promise<Omit<UserEntity, 'password'>> {
    const userExists=await this.usersRepository.createQueryBuilder('users').addSelect('users.password').where('users.email=:email',{email:userSignInDto.email}).getOne();
    if(!userExists) throw new BadRequestException('Bad creadentials.')
    const matchPassword=await compare(userSignInDto.password,userExists.password);
    if(!matchPassword) throw new BadRequestException('Bad creadentials.');
    const { password, ...userWithoutPassword } = userExists;
    return userWithoutPassword;
    }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    const user= await this.usersRepository.findOneBy({id});
    if(!user) throw new NotFoundException('user not found');
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email:string){
    return await this.usersRepository.findOneBy({email});
  }

  async accessToken(user: UserEntity) {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error('ACCESS_TOKEN_SECRET_KEY is not defined');
    }
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRE_TIME || '1h';
      const options: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'], 
    };
    return sign(
      { id: user.id, email: user.email },
      secretKey,
      options
    );
  }
  
  

}
