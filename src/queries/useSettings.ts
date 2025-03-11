import { useQuery } from '@tanstack/react-query';

export const useSettings = () => useQuery({
  queryKey: ['settings'],
  queryFn: async () => window.electronAPI.getData('settings'),
});

export default useSettings;
