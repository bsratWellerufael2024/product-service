import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Products } from './product.entity';

@Entity('variant')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Products, (product) => product.variants, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'productId' }) 
  productId: Products;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  quantity_available: number; 

  @Column('decimal', { precision: 10, scale: 2,default:1 })
  weight: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // Corrected to track updates
  updatedAt: Date;
}
