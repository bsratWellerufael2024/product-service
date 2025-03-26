// src/utils/product-code-generator.ts

export class ProductCodeGenerator {
  private prefix: string;
  private length: number;

  constructor(prefix = 'PROD-', length = 4) {
    this.prefix = prefix;
    this.length = length;
  }

  generate(id: number): string {
    const padded = id.toString().padStart(this.length, '0');
    return `${this.prefix}${padded}`;
  }
}
