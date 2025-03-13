import { useQuery } from '@tanstack/react-query';

export const useStoragePath = () => useQuery({
  queryKey: ['storagePath'],
  queryFn: window.electronAPI.getStoragePath,
});

export default useStoragePath;
