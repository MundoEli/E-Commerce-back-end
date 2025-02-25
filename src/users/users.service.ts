import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash,compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'crypto';

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

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
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

}
