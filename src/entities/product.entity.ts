import { UnitCoversion } from './unitConversion.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductVariant } from './variant.entity';

@Entity('products')
export class Products {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column()
  productName: string;

  @Column()
  specification: string;

  @Column()
  baseUnit: string;

  @ManyToOne(() => UnitCoversion, (unitConversion) => unitConversion.products, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'unitConversionId', referencedColumnName: 'id' })
  unitConversion: UnitCoversion;

  @Column({ default: 0 })
  openingQty: number;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' }) 
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product) 
  variants: ProductVariant[];
  @Column()
  cost_price: number;

  @Column()
  selling_price: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  type: 'active' | 'inactive';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
