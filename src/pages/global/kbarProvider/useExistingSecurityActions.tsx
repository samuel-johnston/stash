import { Action, useRegisterActions } from 'kbar';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const useExistingSecurityActions = () => {
  const navigate = useNavigate();

  const { data: securityOptions, isLoading } = useQuery<Action[]>({
    queryKey: ['kbarSecurityOptions'],
    queryFn: async () => {
      const securities = await window.electronAPI.getData('securities');
      return Array.from(securities.values()).map((security) => ({
        id: security.symbol,
        name: security.symbol,
        subtitle: security.name,
        keywords: security.type + ' ' + security.exchange,
        perform: () => navigate('/trading/add', { state: { symbol: security.symbol } }),
        priority: 10,
      })).sort((a, b) => a.id.localeCompare(b.id));
    },
  });

  useRegisterActions(securityOptions ?? [], [securityOptions]);

  return { isLoading };
};

export default useExistingSecurityActions;
