import { SelectOption } from '@components/RHFSelect';
import { useQuery } from '@tanstack/react-query';

export const useAccountOptions = ({ allAccountsOption = false } = {}) => useQuery<SelectOption[]>({
  queryKey: ['accountOptions'],
  queryFn: async () => {
    const accountOptions: SelectOption[] = [];
    if (allAccountsOption) {
      accountOptions.push({
        value: '',
        label: 'All Accounts',
      });
    }

    const accounts = await window.electronAPI.getData('accounts');
    accounts.forEach((account) => accountOptions.push({
      value: account.accountId,
      label: account.name,
      subtitle: account.accountId,
    }));

    return accountOptions;
  },
});

export default useAccountOptions;
