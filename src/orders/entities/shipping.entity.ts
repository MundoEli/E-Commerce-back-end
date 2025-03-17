import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { OrderStatus } from "../enums/order-status.enum";
import { UserEntity } from "src/users/entities/user.entity";
import { OrderEntity } from "./order.entity";

@Entity({name:"shippings"})
export class ShippingEntity {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    phone:string;
    @Column({default:' '})
    name:string;
    @Column()
    address:string;
    @Column()
    city:string;
    @Column()
    postCode:string;
    @Column()
    state:string;
    @Column()
    country:string;
    @OneToOne(()=>OrderEntity,(order)=>order.shippingAddress)
    order:OrderEntity;
}