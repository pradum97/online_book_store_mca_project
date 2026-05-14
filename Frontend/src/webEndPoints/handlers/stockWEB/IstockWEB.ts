export interface ICreateStockPayload {
  book_id: string;
  book_uom_id: string;
  quantity: number;
  mrp: number;
  purchase_rate: number;
  is_default_stock: boolean;
}

export interface IUpdateStockPayload {
  quantity: number;
  mrp: number;
  purchase_rate: number;
  is_default_stock: boolean;
}
