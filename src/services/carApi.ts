import axios from "axios";
import config from "../config";


// fetch cars with search and pagination
export const fetchCars = async (search: string, page: number, limit: number = 10) => {
 console.log(config.fetchCars)
  try {

    const params = { search, page, limit };
    const res = await axios.get(config.fetchCars, { params });
    return res.data;
  } catch (error: any) {
    console.error("Error fetching cars:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch cars");
  }
};

// fetch a single car by ID
export const fetchCarById = async (id: number) => {
  try {
    const res = await axios.post(config.fetchCarById, { id });
    return res.data;
  } catch (error: any) {
    console.error("Error fetching car by ID:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch car details");
  }
};

// filter cars based on filters
export const filterCars = async (
  filters: { column: string; operator: string; value: any }[],
  page: number,
  limit: number = 10
) => {
  try {
    const params = { page, limit };
    const res = await axios.post(config.fetchCarByFilter, { filters }, { params });
    return res.data;
  } catch (error: any) {
    console.error("Error filtering cars:", error);
    throw new Error(error.response?.data?.error || "Failed to filter cars");
  }
};

// soft delete car 
export const softDeleteCar = async (id: number) => {
  try {
    const res = await axios.post(config.deleteCarById, { id });
    return res.data;
  } catch (error: any) {
    console.error("Error soft deleting car:", error);
    throw new Error(error.response?.data?.error || "Failed to delete car");
  }
};
