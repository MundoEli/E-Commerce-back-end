import { IsNotEmpty,IsEmail,MinLength } from "class-validator";

export class UserSignInDto{
@IsNotEmpty({message:'email can not be empty'})
@IsEmail({},{message:'Pleadse provide a valid email'})
email:string;

@IsNotEmpty({message:'password can not be empty'})
@MinLength(5,{message:'Password minimum character should be 5'})
password:string;
}