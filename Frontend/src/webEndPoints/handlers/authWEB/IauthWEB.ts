export interface IValidateSignupEP {
  username?: string;
  email?: string;
}

export interface IGetProfileEP {
  user_id: string;
  username: string;
  email: string;
  user_type_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  gender: string;
  mobile: string;
  status: string;
  is_active: boolean;
  created_date: string;
  full_name: string;
}

export interface IResetPasswordEP {
  reset_token: string;
  new_password: string;
}
