export interface IGetAllUsersEP {
  user_id: string;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  dob: string;
  email: string;
  mobile: string;
  status: string;
  is_active: boolean;
  created_date: string;
}

export interface IGetUserTypesEP {
  user_type_id: number;
  user_type_code: string;
  user_type_name: string;
}

export interface IApprovedUserEP {
  user_id: number;
  web_page_id: number;
  user_type_id: number;
  approval_desc: string;
}

export interface IUpdateUserPasswordEP {
  user_id: number;
  password: string;
  isPasswordSend: boolean;
}

export interface IGetUserByUserTypeIdEP {
  user_id: number;
  full_name: string;
  avatar: string;
  username: string;
  phone: string;
}

export interface IGetAllUserTypesEP {
  user_type_id: number;
  user_type_code: string;
  user_type_name: string;
  description?: string | null;
  access_level: number;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IUpdateMyProfileEP {
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob?: string | null;
  gender?: string;
  mobile?: string;
}
export interface IAddressPayload {
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default?: boolean;
}

export interface IGetMyAddressesEP {
  address_id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
  created_date: string;
}
