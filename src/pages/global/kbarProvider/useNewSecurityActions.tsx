import { Action, useKBar, useRegisterActions } from 'kbar';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { enqueueSnackbar } from 'notistack';

import { newSecurityActionId } from './index';

const useNewSecurityActions = () => {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);

  const previousRootActionId = useRef<string | null | undefined>(null);
  const previousSearchQuery = useRef<string | null>(null);

  const { searchQuery, currentRootActionId, query } = useKBar((state) => ({
    searchQuery: state.searchQuery,
    currentRootActionId: state.currentRootActionId,
  }));

  const debounce = useDebouncedCallback(async () => {
    if (currentRootActionId !== newSecurityActionId) {
      setIsLoading(false);
      return;
    }

    if (searchQuery === '') {
      setActions([]);
      setIsLoading(false);
      return;
    }

    const searchResults = await window.electronAPI.searchSecurities(searchQuery);
    const actions = searchResults.map((result) => ({
      id: `search-query-${searchQuery}-result-${result.symbol}`,
      name: result.symbol,
      subtitle: result.name,
      keywords: result.type + ' ' + result.exchange,
      parent: newSecurityActionId,
      perform: async () => {
        try {
          await window.electronAPI.addSecurity(result);
          enqueueSnackbar(`Successfully added ${result.symbol}!`, { variant: 'success' });
          queryClient.invalidateQueries({ queryKey: ['kbarSecurityOptions'] });
          queryClient.invalidateQueries({ queryKey: ['securityOptions'] });
          query.setCurrentRootAction(null);
        } catch (error) {
          // Need to split error message as electron wraps message
          enqueueSnackbar(`Could not add ${result.symbol}: ${error.message.split('Error: ')[1]}`, { variant: 'error' });
        }
      },
    }));

    setActions(actions);
    setIsLoading(false);
  }, 500);

  const cancelSearch = () => {
    debounce.cancel();
    setActions([]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentRootActionId !== previousRootActionId.current) {
      if (!currentRootActionId) {
        // Moving back to existing securities page
        cancelSearch();
      } else if (currentRootActionId === newSecurityActionId) {
        // Moving to search securities page
        query.setSearch(previousSearchQuery.current ?? '');
      }
    } else if (currentRootActionId === newSecurityActionId) {
      // Clearing search query should stop search
      if (searchQuery === '') {
        cancelSearch();
      } else {
        // Show loading when searching for new securities (while debounce is pending)
        if (!isLoading) {
          setIsLoading(true);
          setActions([]);
        }
        debounce();
      }
    }

    previousRootActionId.current = currentRootActionId;
    previousSearchQuery.current = searchQuery;
  }, [searchQuery, currentRootActionId]);

  useRegisterActions(actions, [actions]);

  return { isLoading };
};

export default useNewSecurityActions;
