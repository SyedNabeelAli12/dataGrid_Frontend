import React, { useEffect, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate } from "react-router-dom";
import { fetchCars, softDeleteCar, filterCars } from "../services/carApi";
import { Box, Pagination, IconButton } from "@mui/material";
import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community";
import Loader from "./Loader";
import ConfirmDialog from "./ConfirmDialog";
import { useSnackbar } from "./snackbar";
import CarFilter from "./CarFilter";
import SearchBar from "./SearchBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const DataGrid = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [rowData, setRowData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [fields, setFields] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<{ column: string; operator: string; value: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);

  // debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  //dynamic columns
  const createColumns = useCallback(
    (sampleData: any[]) => {
      if (!sampleData.length) return;

      const baseColumns: ColDef[] = Object.keys(sampleData[0])
        .filter((key) => key !== "id")
        .map((key) => ({
          field: key,
          headerName: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        }));

  //actions addition
      baseColumns.push({
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => navigate(`/view/${params.data.id}`)}>
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.data.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      });

      setColumns(baseColumns);
    },
    [navigate]
  );

  //fetch or filter cars
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = filters.length
        ? await filterCars(filters, pagination.page, pagination.limit)
        : await fetchCars(debouncedSearch, pagination.page, pagination.limit);

      const data = res.data || [];
      setRowData(data);
      setFields(res.fields || {});
      createColumns(data);

      setPagination((prev) => ({
        ...prev,
        total: res.pagination?.total || 0,
      }));
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch cars", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, debouncedSearch, createColumns, showSnackbar]);

  // reload data when filters, search, or page changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setCarToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;
    try {
      await softDeleteCar(carToDelete);
      showSnackbar("Car deleted successfully", "success");
      loadData();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete car", "error");
    } finally {
      setConfirmOpen(false);
      setCarToDelete(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Box sx={{ padding: 2 }}>
      <SearchBar value={search} onChange={setSearch} />

      <CarFilter
        fields={fields}
        onApplyFilters={(f) => {
          setFilters(f);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        columns={columns
          .filter((col) => typeof col.field === "string" && col.field !== "actions")
          .map((col) => ({
            field: col.field as string,
            headerName: col.headerName || col.field!,
          }))}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <div className="ag-theme-alpine" style={{ width: "100%" }}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columns}
                pagination={false}
                domLayout="autoHeight"
                modules={[ClientSideRowModelModule]}
                rowHeight={40}
                headerHeight={50}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  flex: 1,
                  minWidth: 120,
                  cellStyle: { 'text-align': 'center' },
                  headerClass: "ag-center-header",
                }}
              />
            </div>
          </Box>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={pagination.page}
              onChange={(_, newPage) =>
                setPagination((prev) => ({ ...prev, page: newPage }))
              }
              size="small"
            />
          </Box>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        message="Are you sure you want to delete this car?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};
