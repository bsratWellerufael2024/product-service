// import { UnitCoversion } from 'src/unitconversion/unit.entity';
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
  
  // @ManyToOne(() => UnitCoversion, (unitConversion) => unitConversion.products, {
  //   eager: true,
  //   nullable: true,
  // })
  // @JoinColumn({ name: 'baseUnit', referencedColumnName: 'baseUnit' }) // Correct JoinColumn
  // unitConversion: UnitCoversion;

  @Column({ default: 0 })
  openingQty: number;

  @Column()
  categoryId: number;

  // @ManyToOne(() => Category, (category) => category.products, { eager: true })
  // @JoinColumn({ name: 'categoryId' })
  // category: Category;

  @Column()
  cost_price: number;

  @Column()
  selling_price: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'],default:'active' })
  type:'active'|'inactive';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({type:'timestamp'})
   updatedAt:Date
}
