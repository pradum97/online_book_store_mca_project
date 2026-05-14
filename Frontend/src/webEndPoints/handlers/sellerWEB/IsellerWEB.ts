export interface IUpdateSellerStatus {
  seller_id: string;
  action: "APPROVE" | "REJECT";
  message?: string;
}

export interface IGetAllSellersEP {
  seller_id: string;
  request_number: string;
  seller_number: any;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  status: string;
  created_date: string;
  business_name: string;
  business_type: string;
  gst_number: string;
  full_name: string;
}

export interface ISellerDashboardStats {
  totalBooks: number;
  totalCategories: number;
  totalImages: number;
  booksThisMonth: number;
  categoryBreakdown: { name: string; count: number }[];
  booksByMonth: { month: string; count: number }[];
  topCategories: { category: string; books: number; images: number }[];
}
