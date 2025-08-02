
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <IconButton aria-label="back" size="medium" onClick={() => navigate(-1)}>
      <ArrowBackIcon fontSize="inherit" />
    </IconButton>
  );
};

export default BackButton;