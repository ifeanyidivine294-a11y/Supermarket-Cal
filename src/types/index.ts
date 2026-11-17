export type ProductCategory =
  | 'Beverages and Drinks'
  | 'Rice, Grains and Pasta'
  | 'Cooking Oil and Seasoning'
  | 'Snacks and Biscuits'
  | 'Dairy and Breakfast'
  | 'Toiletries and Personal Care'
  | 'Household and Cleaning'
  | 'Frozen Foods'
  | 'Baby Products'
  | 'Other Products';

export const ALL_CATEGORIES: ProductCategory[] = [
  'Beverages and Drinks',
  'Rice, Grains and Pasta',
  'Cooking Oil and Seasoning',
  'Snacks and Biscuits',
  'Dairy and Breakfast',
  'Toiletries and Personal Care',
  'Household and Cleaning',
  'Frozen Foods',
  'Baby Products',
  'Other Products',
];

export type OfficeRole =
  | 'Cashier'
  | 'Sales Representative'
  | 'Shop Attendant'
  | 'Storekeeper'
  | 'Sales Supervisor'
  | 'Other';

export interface DisplaySettings {
  bgColor?: string;
  colorTheme?: 'emerald' | 'navy' | 'blue' | 'purple' | 'slate';
  appearance?: 'light' | 'dark';
  density?: 'compact' | 'comfortable';
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  officeRole: OfficeRole | string;
  phone?: string;
  photoURL?: string;
  accountType: 'admin' | 'salesperson';
  active: boolean;
  displaySettings?: DisplaySettings;
  createdAt: string;
}

export interface ProductSize {
  id: string;
  label: string;
  retailPrice: number;
  smallBusinessPrice: number;
  stockQuantity: number;
}

export interface ProductColour {
  id: string;
  name: string;
  hex: string;
  stockQuantity: number;
  sku?: string;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  imageURL: string;
  category: ProductCategory;
  pricingType: 'original' | 'sizes';
  sizes: ProductSize[];
  colours: ProductColour[];
  retailPrice: number;
  smallBusinessPrice: number;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PricingMode = 'retail' | 'small_business';

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  category: ProductCategory;
  imageURL: string;
  pricingType: 'original' | 'sizes';
  selectedSize?: ProductSize;
  selectedColour?: ProductColour;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface SaleItemSnapshot {
  productId: string;
  name: string;
  sizeLabel?: string;
  colourName?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageURL?: string;
}

export interface Sale {
  saleId: string;
  receiptNumber: string;
  salespersonUid: string;
  salespersonName: string;
  salespersonRole: string;
  pricingMode: PricingMode;
  items: SaleItemSnapshot[];
  subtotal: number;
  discountType: 'fixed' | 'percentage' | 'none';
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  amountPaid: number;
  change: number;
  createdAt: string;
}

export interface InventoryMovement {
  movementId: string;
  productId: string;
  variationId?: string;
  quantityChanged: number;
  movementType: 'sale' | 'restock' | 'adjustment';
  referenceSaleId?: string;
  performedBy: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  currency: string;
  defaultTheme: string;
  lowStockThreshold: number;
}
