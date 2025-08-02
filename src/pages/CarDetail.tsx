import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCarById } from "../services/carApi";
import { Box, Typography } from "@mui/material";
import InfoCard from "../components/InfoCard";
import Header from "../components/Headers";
import { useLOVs } from "../components/Context/lov";
import Loader from "../components/Loader";
import { useSnackbar } from "../components/snackbar";
import BackButton from "../components/BackButton";

const CarDetail = () => {
  const { id } = useParams();
  const { showSnackbar } = useSnackbar();
  const { lovs, loading: lovsLoading } = useLOVs();

  const [car, setCar] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch car details
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

  // Early return: still loading
  if (lovsLoading || loading) return <Loader />;

  // Early return: error state
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

  // Early return: no data
  if (!car || !lovs) {
    return (
      <Box sx={{ p: 2 }}>
        <BackButton />
        <Typography variant="h6">
          {car ? "Data not found." : "Car not found."}
        </Typography>
      </Box>
    );
  }

  // --- Helpers ---
  const isForeignKey = (key: string) => key.endsWith("_id");

  const mapToLovKey = (key: string) => {
    const base = key.replace(/_id$/, "");
    switch (base) {
      case "plug_type":
        return "plugTypes";
      case "powertrain":
        return "powertrains";
      case "body_style":
        return "bodyStyles";
      default:
        return base + "s";
    }
  };

  const getLovName = (
    list: { id: number; name: string }[] | undefined,
    id: number
  ) => list?.find((item) => item.id === id)?.name || "Unknown";

  const prettifyLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/\bid\b/i, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  // Build display data
  const carInfo = Object.entries(car).map(([key, value]) => {
    let displayValue = value ?? "Unknown";

    if (isForeignKey(key) && typeof value === "number") {
      const lovList = lovs[mapToLovKey(key) as keyof typeof lovs] as
        | { id: number; name: string }[]
        | undefined;
      if (lovList) {
        displayValue = getLovName(lovList, value);
      }
    }

    return {
      label: prettifyLabel(key),
      value: displayValue,
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
