import { Column, Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
// import { Products } from 'src/products/product.entity';
import { Products } from './product.entity';
@Entity('units')
export class UnitCoversion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Ensures baseUnit is unique
  baseUnit: string;

  @Column()
  containerUnit: string;

  @Column('float', { default: 1 }) 
  conversionRate: number;

  @Column({ default: false })
  isUserDefined: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  
  @OneToMany(() => Products, (product) => product.unitConversion)
  products: Products[];
}
