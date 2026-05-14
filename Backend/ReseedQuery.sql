BEGIN;

TRUNCATE TABLE
    public.tbl_book_images,
    public.tbl_book_uom,
    public.tbl_books,
    public.tbl_cart,
    public.tbl_cart_items,
    public.tbl_email_logs,
    public.tbl_order_addresses,
    public.tbl_order_items,
    public.tbl_order_returns,
    public.tbl_order_status_logs,
    public.tbl_orders,
    public.tbl_otp_details,
    public.tbl_payment_attempts,
    public.tbl_payment_details,
    public.tbl_payment_logs,
    public.tbl_payments,
    public.tbl_refresh_tokens,
    public.tbl_return_status_logs,
    public.tbl_seller_bank_details,
    public.tbl_seller_business_details,
    public.tbl_seller_documents,
    public.tbl_seller_status_log,
    public.tbl_sellers,
    public.tbl_sessions,
    public.tbl_stock,
    public.tbl_stock_history,
    public.tbl_stock_movements,
    public.tbl_user_addresses,
    public.tbl_user_type_mapping,
    public.tbl_users
RESTART IDENTITY CASCADE;

-- ADMIN USER CREATE
INSERT INTO public.tbl_users (
    username,
    first_name,
    middle_name,
    last_name,
    dob,
    gender,
    mobile,
    email,
    password,
    is_active,
    status,
    user_type_code
)
VALUES (
    'admin',
    'System',
    NULL,
    'Administrator',
    '2000-01-01',
    'MALE',
    '9999999999',
    'admin@gmail.com',
    '$2b$10$iuVmtz1SMHnm53rE6kVyMOS2O03QFLQuORhGulajOrgE7TVSC6vfS',
    true,
    'ACTIVE',
    'ADMIN'
);

COMMIT;