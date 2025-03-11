import { useQuery } from '@tanstack/react-query';
import { countries } from '@data/countries';

export const useOptions = () => useQuery({
  queryKey: ['options'],
  queryFn: async () => ({
    countries,
    financialStatus: await window.electronAPI.getData('financialStatus'),
    miningStatus: await window.electronAPI.getData('miningStatus'),
    resources: await window.electronAPI.getData('resources'),
    products: await window.electronAPI.getData('products'),
    recommendations: await window.electronAPI.getData('recommendations'),
  }),
});

export default useOptions;
