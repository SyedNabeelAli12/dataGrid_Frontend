import axios from "axios";
import config from "../config";

// Fetch ListOfValues with search and pagination
export const fetchLOVs = async () => {
  try {
    const res = await axios.get(config.lovs,);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching Lovs:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch");
  }
};