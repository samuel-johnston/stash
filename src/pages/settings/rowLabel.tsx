import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

interface Props {
  title: string;
  subtitle: string;
}

/**
 * A helper function that returns a skeleton component with the given width.
 * @param width How many pixels wide
 */
const skeleton = (width: number) => {
  return (
    <Skeleton
      width={width}
      animation="wave"
      sx={{ animationDuration: "0.8s" }}
    />
  );
};

const RowLabel = (props: Props) => {
  const { title, subtitle } = props;
  return (
    <Box>
      <Typography variant="h6" fontWeight={400} color="primary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={400} color="secondary">
        {subtitle === "" ? skeleton(440) : subtitle}
      </Typography>
    </Box>
  );
};

export default RowLabel;
