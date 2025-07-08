import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

const DialogCloseButton = ({ onClose }: { onClose: () => void }) => {
  const { palette } = useTheme();
  return (
    <IconButton
      disableRipple
      onClick={onClose}
      sx={{
        position: 'absolute',
        top: '6px',
        right: '6px',
        color: palette.grey[300],
        '&:hover': {
          color: palette.grey[100],
        },
      }}
    >
      <CloseRoundedIcon style={{ fontSize: 18 }} />
    </IconButton>
  );
};

export default DialogCloseButton;
