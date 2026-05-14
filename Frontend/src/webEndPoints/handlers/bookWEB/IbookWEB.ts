export interface IGetSellerBookListEP {
  book_id: string;
  title: string;
  author: string;
  description: string;
  category_name: string;
  images: IBookListImage[];
  category_id: number;
}

export interface IBookListImage {
  image_id: string;
  image_url: string;
}

export interface IGetCategoriesEP {
  category_id: string;
  category_code: string;
  category_name: string;
  category_description: string;
  is_active: boolean;
  created_date: string;
}

export interface IGetUOMsEP {
  uom_id: string;
  uom_code: string;
  uom_name: string;
  description: string;
  is_active: boolean;
  organization_name: any;
  installation_name: any;
  created_at: string;
}

export interface IGetAllBooksEP {
  book_id: string;
  title: string;
  author: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  discount: number;
  stock_id: string;
  category_name: string;
  quantity: number;
  is_in_cart: boolean;
}
