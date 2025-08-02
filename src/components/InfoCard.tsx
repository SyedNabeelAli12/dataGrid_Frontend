import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Stack } from "@mui/material";
import { InfoCardProps } from "../types/types";

const palette = [
  "#FE4A49",
  "#005B96",
  "#851E3E",
  "#3DA4AB",
  "#F6CD61",
  "#54b2a9",
  "#4d648d",
];


const getRandomColor = () => {
  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
};

const InfoCard: React.FC<InfoCardProps> = ({ items }) => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setColors(items.map(() => getRandomColor()));
  }, [items]);

  return (
<Stack
  direction="row"
  spacing={2}
  useFlexGap
  flexWrap="wrap"
  justifyContent="center"
  alignItems="stretch"
>
  {items.map(({ label, value }, index) => (
    <Box
      key={label}
      sx={{
        width: { xs: "100%", sm: "48%", md: "30%" },
        display: "flex",
      }}
    >
      <Card
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 1,
          position: "relative",
          backgroundColor: "#f0f0f0",
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: colors[index],
            borderRadius: "4px 0 0 4px",
          }}
        />
        <Box sx={{ ml: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
            gutterBottom
          >
            {label}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Card>
    </Box>
  ))}
</Stack>
  );
};

export default InfoCard;
