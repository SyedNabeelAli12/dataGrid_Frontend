import React from "react";
import { TextField } from "@mui/material";
import { SearchBarProps } from "../types/types";


const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <TextField
      label="Search"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        mb: 1,
        width: "30%",
        "& .MuiInputLabel-root": {
          color: "gray",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "gray",
        },
        "& .MuiOutlinedInput-root.Mui-focused > fieldset": {
          borderColor: "black",
        },
      }}
    />
  );
};

export default SearchBar;
