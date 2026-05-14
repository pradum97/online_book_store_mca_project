export interface IGetWebPagesEP {
  web_page_id: number;
  web_page_code: string;
  page_name: string;
  url: string;
  icon_name: string;
  can_view: number;
  can_add: number;
  can_edit: number;
  can_delete: number;
  can_download: number;
  can_upload: number;
  is_setting: number;
  visible_in_menu: number;
}

export interface IGetAllWebPagesEP {
  web_page_id: number;
  web_page_code: string;
  page_name: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
  visible_in_menu: boolean;
  sequence: number;
  is_setting: boolean;
  created_at?: string;
}

export interface IGetPermissionMappingEP {
  web_page_id: number;
  page_name: string;
  web_page_code: string;
  url: string;
  user_id?: number;
  user_type_id?: number;
  user_web_mapping_id?: number;

  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_download: boolean;
  can_upload: boolean;
  can_print: boolean;
  can_approved: boolean;
  can_assigned: boolean;
  can_view_status: boolean;
  can_view_more: boolean;
  can_export_excel: boolean;
  can_export_pdf: boolean;
  is_self_view: boolean;
  can_import: boolean;
  is_active: boolean;
}
export type PermissionBooleanKeys =
  | "can_view"
  | "can_add"
  | "can_edit"
  | "can_delete"
  | "can_download"
  | "can_upload"
  | "can_print"
  | "can_approved"
  | "can_assigned"
  | "can_view_status"
  | "can_view_more"
  | "can_export_excel"
  | "can_export_pdf"
  | "can_import"
  | "is_self_view"
  | "is_active";

export interface IExtendedPermissionRow extends IGetPermissionMappingEP {
  user_web_mapping_id?: number;
  is_permission?: boolean;
}
