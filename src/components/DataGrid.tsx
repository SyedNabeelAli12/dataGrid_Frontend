import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { fetchLOVs } from "../services/lovApi";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const DataGrid = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [lovs, setLovs] = useState<any>(null);
  const [lovsLoading, setLovsLoading] = useState(true);

  const [rowData, setRowData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [fields, setFields] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<{ column: string; operator: string; value: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);

  useEffect(() => {
    async function getLOVs() {
      try {
        const data = await fetchLOVs();
        setLovs(data);
      } catch {
        showSnackbar("Failed to load LOVs", "error");
      } finally {
        setLovsLoading(false);
      }
    }
    getLOVs();
  }, [showSnackbar]);

  const metaData = useMemo(() => {
    if (!lovs?.table_columns) return [];
    return lovs.table_columns
      .filter((col: any) => col.datatype?.toLowerCase() !== "boolean")
      .map((col: any) => ({
        field: col.column_name,
        headerName: col.name,
        type:
          ["int", "decimal", "number"].some((numType) =>
            col.datatype?.toLowerCase().includes(numType)
          )
            ? "number"
            : "string",
      }));
  }, [lovs?.table_columns]);

  const createColumns = useCallback(() => {
    if (!lovs?.table_columns) return;

    const cols: ColDef[] = lovs.table_columns.map((col: any) => ({
      field: col.column_name,
      headerName: col.name,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 120,
      cellStyle: { textAlign: "center" },
      valueFormatter: (params: any) => {
        const val = params.value;
        if (col.datatype === "Boolean") {
          return val ? "Yes" : "No";
        }
        if (col.datatype === "Date" && val) {
          try {
            return new Date(val).toISOString().split("T")[0];
          } catch {
            return val;
          }
        }
        return val ?? "Unknown";
      },
    }));

    cols.push({
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => navigate(`/view/${params.data.id}`, { state: { lovs } })}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setCarToDelete(params.data.id);
              setConfirmOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      minWidth: 120,
      pinned: "right",
    });

    setColumns(cols);
  }, [lovs, navigate]);

  useEffect(() => {
    if (!lovsLoading) createColumns();
  }, [lovsLoading, createColumns]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = filters.length
        ? await filterCars(filters, pagination.page, pagination.limit)
        : await fetchCars(debouncedSearch, pagination.page, pagination.limit);

      setRowData(res.data || []);
      setFields(res.fields || {});
      setPagination((p) => ({ ...p, total: res.pagination?.total || 0 }));
    } catch {
      showSnackbar("Failed to fetch cars", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, debouncedSearch, showSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const confirmDelete = async () => {
    if (!carToDelete) return;
    try {
      await softDeleteCar(carToDelete);
      showSnackbar("Car deleted successfully", "success");
      loadData();
    } catch {
      showSnackbar("Failed to delete car", "error");
    } finally {
      setConfirmOpen(false);
      setCarToDelete(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (lovsLoading || loading) return <Loader />;

  return (
    <Box sx={{ p: 2 }}>
      <SearchBar value={search} onChange={setSearch} />

      <CarFilter
        filters={filters}
        onApplyFilters={(f) => {
          setFilters(f);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        metaData={metaData}
      />

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
              cellStyle: { textAlign: "center" },
              headerClass: "ag-center-header",
            }}
          />
        </div>
      </Box>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={pagination.page}
          onChange={(_, page) => setPagination((p) => ({ ...p, page }))}
          size="small"
        />
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        message="Are you sure you want to delete this car?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};
