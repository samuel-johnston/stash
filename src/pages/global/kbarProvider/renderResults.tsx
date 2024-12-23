import { KBarResults, useMatches } from "kbar";
import { tokens } from "../../../theme";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const RenderResults = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string"
          ? (
              <Typography
                fontSize="12px"
                textTransform="uppercase"
                p="8px 18px"
                sx={{ opacity: 0.5 }}
              >
                {item}
              </Typography>
            )
          : (
              <Box
                display="flex"
                alignItems="center"
                bgcolor={active ? colors.grey[700] : "transparent"}
                p="12px 16px"
                gap="8px"
                borderLeft={`2px solid ${active ? colors.grey[100] : "transparent"}`}
                borderRadius="2px"
              >
                {item.icon && item.icon}
                <Box
                  display="flex"
                  flexDirection="column"
                >
                  <Typography>
                    {item.name}
                  </Typography>
                  <Typography sx={{ opacity: 0.5 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              </Box>
            )}
    />
  );
};

export default RenderResults;
