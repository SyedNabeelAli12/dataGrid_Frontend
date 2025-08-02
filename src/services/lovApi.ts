import axios from "axios";

const BASE_URL = "http://localhost:5000/api/lovs";

// Fetch ListOfValues with search and pagination
export const fetchLOVs = async () => {
  try {
    const res = await axios.get(`${BASE_URL}`,);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching Lovs:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch");
  }
};