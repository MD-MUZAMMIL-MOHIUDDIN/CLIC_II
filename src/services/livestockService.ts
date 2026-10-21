import shopsSeed from '../data/livestock-shops.json';
import productsSeed from '../data/products.json';
import { LivestockShop, LivestockProduct } from '../types';
import { getInitialData, saveStorageData } from './storageHelper';

const SHOPS_KEY = 'livestock_shops';
const PRODUCTS_KEY = 'products';

class LivestockService {
  public getAllShops(): any[] {
    return getInitialData<any[]>(SHOPS_KEY, shopsSeed);
  }

  public getAllProducts(): LivestockProduct[] {
    return getInitialData<LivestockProduct[]>(PRODUCTS_KEY, productsSeed as LivestockProduct[]);
  }

  public getProductById(id: string): LivestockProduct | undefined {
    return this.getAllProducts().find(p => p.id === id);
  }

  public getProductsBySellerId(sellerId: string): LivestockProduct[] {
    return this.getAllProducts().filter(p => p.sellerId === sellerId);
  }

  public searchProducts(params: {
    query?: string;
    category?: string;
    liveAnimalsOnly?: boolean;
    maxPrice?: number;
    inStockOnly?: boolean;
    state?: string;
  }): LivestockProduct[] {
    let list = this.getAllProducts();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (params.category && params.category !== 'All') {
      list = list.filter(p => p.category === params.category);
    }
    if (params.liveAnimalsOnly) {
      list = list.filter(p => p.isLiveAnimal);
    }
    if (params.maxPrice) {
      list = list.filter(p => p.price <= params.maxPrice!);
    }
    if (params.inStockOnly) {
      list = list.filter(p => p.stockStatus === 'In Stock' || p.stockStatus === 'Available');
    }
    if (params.state && params.state !== 'All') {
      list = list.filter(p => p.location.state === params.state);
    }
    return list;
  }

  public addProduct(productData: Omit<LivestockProduct, 'id'>): LivestockProduct {
    const list = this.getAllProducts();
    const newProduct: LivestockProduct = {
      ...productData,
      id: `prod_${Date.now().toString().slice(-4)}`
    };
    list.unshift(newProduct);
    saveStorageData(PRODUCTS_KEY, list);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<LivestockProduct>): boolean {
    const list = this.getAllProducts();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updates };
    saveStorageData(PRODUCTS_KEY, list);
    return true;
  }
}

export const livestockService = new LivestockService();
