import { Roles } from "src/utility/common/user-roles.enum";
import { Column ,Entity, PrimaryGeneratedColumn,CreateDateColumn,Timestamp,UpdateDateColumn } from "typeorm";
import { Exclude
    
 } from "class-transformer";
@Entity('users')
export class UserEntity {
@PrimaryGeneratedColumn()
id:number;
@Column()
name:string;
@Column({unique:true})
email:string;
@Column({select:false})
@Exclude()
password:string;
@Column({type:'enum',enum:Roles,array:true,default:[Roles.USER]})
roles:Roles[];
@CreateDateColumn()
createdAt:Timestamp;
@UpdateDateColumn()
updateAt:Timestamp;
}
