import { SelectOption } from '@components/RHFSelect';
import { useQuery } from '@tanstack/react-query';

export const useSecurityOptions = () => useQuery<SelectOption[]>({
  queryKey: ['securityOptions'],
  queryFn: async () => {
    const securities = await window.electronAPI.getData('securities');
    return Array.from(securities.values()).map((security) => ({
      value: security.symbol,
      label: security.symbol,
      subtitle: security.name,
    })).sort((a, b) => a.label.localeCompare(b.label));
  },
});

export default useSecurityOptions;
