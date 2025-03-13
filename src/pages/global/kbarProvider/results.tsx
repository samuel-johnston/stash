import { KBarResults, useKBar, useMatches } from 'kbar';

import CircularProgress from '@mui/material/CircularProgress';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import { newSecurityActionId } from './index';

const Results = ({ loading }: { loading: boolean }) => {
  const { palette } = useTheme();

  const { currentRootActionId } = useKBar((state) => ({
    currentRootActionId: state.currentRootActionId,
  }));

  return (
    <Stack>
      <RenderResults loading={loading} />
      <Divider sx={{ borderColor: palette.grey[800] }} />
      <Box display="flex" justifyContent="center" alignItems="center" gap="20px" py="8px">
        <Instruction command="↑↓" label="to navigate" />
        <Instruction command="↵" label="to use" />
        {typeof currentRootActionId === 'string' && <Instruction command="⌫" label="to go back" />}
        <Instruction command="esc" label="to dismiss" />
      </Box>
    </Stack>
  );
};

const RenderResults = ({ loading }: { loading: boolean }) => {
  const { palette } = useTheme();
  const { results } = useMatches();

  const { currentRootActionId, searchQuery, actions } = useKBar((state) => ({
    currentRootActionId: state.currentRootActionId,
    searchQuery: state.searchQuery,
    actions: state.actions,
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size="40px" />
      </Box>
    );
  }

  if (results.length === 0) {
    if (!currentRootActionId) {
      // If no results found on the existing securities page, suggest adding new security
      results.push(actions[newSecurityActionId]);
    } else {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py="20.5px">
          <Typography color="secondary" variant="h6">
            {searchQuery === '' ? 'Search for stocks, ETF\'s & more' : 'No results found.'}
          </Typography>
        </Box>
      );
    }
  }

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string'
          ? (
              <Typography
                fontSize="12px"
                textTransform="uppercase"
                color="secondary"
                p="8px 18px"
              >
                {item}
              </Typography>
            )
          : (
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                p="12px 16px"
                gap="8px"
                bgcolor={active ? palette.grey[700] : 'transparent'}
                borderLeft={`2px solid ${active ? palette.grey[100] : 'transparent'}`}
                borderRadius="2px"
              >
                <Stack direction="row" gap="8px" alignItems="center">
                  {item.icon}
                  <Stack direction="column">
                    <Typography fontSize={item.subtitle ? 14 : 15.5}>
                      {item.name}
                    </Typography>
                    <Typography color="secondary">
                      {item.subtitle}
                    </Typography>
                  </Stack>
                </Stack>
                {item.keywords && item.keywords !== '' && (
                  <Stack direction="column">
                    <Typography color="secondary" align="right">
                      {item.keywords.split(' ')[0]}
                    </Typography>
                    <Typography color="secondary" align="right">
                      {item.keywords.split(' ')[1] ?? ''}
                    </Typography>
                  </Stack>
                )}
              </Box>
            )}
    />
  );
};

const Instruction = ({ command, label }: { command: string; label: string }) => (
  <Box display="flex" flexDirection="row" gap="4px">
    <Typography variant="h6" color="secondary" fontWeight={700}>{command}</Typography>
    <Typography variant="h6" color="secondary">{label}</Typography>
  </Box>
);

export default Results;
