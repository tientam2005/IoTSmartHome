export interface TenantAccount {
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  password: string; // plain text cho demo
  createdAt: string;
}

let _accounts: TenantAccount[] = [];

export const getAccounts = () => _accounts;

export const createTenantAccount = (tenantId: string, name: string, phone: string, email?: string): TenantAccount => {
  // Username = số điện thoại, password = 6 số cuối SĐT
  const password = phone.slice(-6);
  const account: TenantAccount = {
    tenantId,
    name,
    email: email || `${phone}@phongtro.app`,
    phone,
    password,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  _accounts = [..._accounts, account];
  return account;
};

export const getAccountByTenantId = (tenantId: string) =>
  _accounts.find(a => a.tenantId === tenantId);

export const getAccountByPhone = (phone: string) =>
  _accounts.find(a => a.phone === phone);
