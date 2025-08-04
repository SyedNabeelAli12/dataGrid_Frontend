import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCarById } from "../services/carApi";
import { Box, Typography } from "@mui/material";
import InfoCard from "../components/InfoCard";
import Header from "../components/Headers";
import Loader from "../components/Loader";
import { useSnackbar } from "../components/snackbar";
import BackButton from "../components/BackButton";

const CarDetail = () => {
  const { id } = useParams();
  const { showSnackbar } = useSnackbar();
  const location = useLocation();
  const lovs = location.state?.lovs;

  const [car, setCar] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      if (!id) {
        setError("Invalid car ID");
        showSnackbar("Invalid car ID", "error");
        setLoading(false);
        return;
      }

      try {
        const res = await fetchCarById(Number(id));
        setCar(res?.car || null);
      } catch (err: any) {
        const message = err.message || "Failed to fetch car details";
        setError(message);
        showSnackbar(message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id, showSnackbar]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <BackButton />
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!car || !lovs?.table_metaData) {
    return (
      <Box sx={{ p: 2 }}>
        <BackButton />
        <Typography variant="h6">Car not found or LOVs not provided.</Typography>
      </Box>
    );
  }

  const carInfo = lovs.table_metaData.map((meta: any) => {
    let value = car[meta.column_name];

    if (meta.datatype === "Boolean") {
      value = value ? "Yes" : "No";
    } else if (meta.datatype === "Date" && value) {
      try {
        value = new Date(value).toISOString().split("T")[0];
      } catch {}
    } else if (value === null || value === undefined) {
      value = "Unknown";
    }

    return {
      label: meta.name,
      value,
    };
  });

  return (
    <Box sx={{ p: 2 }}>
      <BackButton />
      <Header content={`${car.brand ?? ""} ${car.model ?? ""}`} />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <InfoCard items={carInfo} />
      </Box>
    </Box>
  );
};

export default CarDetail;
