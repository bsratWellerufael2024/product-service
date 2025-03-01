// import { Column, Entity, PrimaryGeneratedColumn,ManyToOne, CreateDateColumn} from "typeorm";
// import { Products } from "./product.entity";

// @Entity('variant')
// export class ProductVariant {
//   @PrimaryGeneratedColumn()
//   id: number;
//   @Column()
//   productId: number;

//   //    @ManyToOne(() => Products, (product) => Products.products, {
//   //        eager: true,
//   //        nullable: true,
//   //      })
//   @Column()
//   size: string;
//   @Column()
//   color: string;
//   @Column()
//   price: string;
//   @Column({default:0})
//   quantity_available: string;
//   @Column()
//   weight: string;
//   @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;
//   @CreateDateColumn({ type: 'timestamp' })
//   updatedAt: Date;
// }
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('variant')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // productId: number;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column('decimal', { precision: 10, scale: 2 }) // ✅ Ensure price is a decimal
  price: number;

  @Column({ default: 0 })
  quantity_available: number; // ✅ Change from string to number

  @Column('decimal', { precision: 10, scale: 2 }) // ✅ Ensure weight is a decimal
  weight: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
