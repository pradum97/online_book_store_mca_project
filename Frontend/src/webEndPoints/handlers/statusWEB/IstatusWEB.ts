export interface IGetAllStatusSetsEP {
  status_set_id: number;
  status_set_name: string;
  status_set_code: string;
  description: string;
  is_active: boolean;
}

export interface IGetAllStatusValueEP {
  status_value_id: number;
  status_set_name: string;
  status_value_code: string;
  status_value_name: string;
  description: string | null;
  is_active: 0 | 1;
  background_color: string | null;
  value_color: string | null;
  is_remark_required: 0 | 1 | boolean;
  is_attachments_required: 0 | 1 | boolean;
  status_set_id: number;
  created_date: string;
}
