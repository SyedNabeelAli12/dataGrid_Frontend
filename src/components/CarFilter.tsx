import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  MenuItem,
  TextField,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "./snackbar";
import { CarFilterProps, Filter } from "./../types/types";

const STRING_OPERATORS = [
  "contains",
  "equals",
  "starts with",
  "ends with",
  "is empty",
];

const NUMBER_OPERATORS = ["equals", "greater than", "less than", "is empty"];

const CarFilter: React.FC<CarFilterProps> = ({ filters: propFilters, onApplyFilters, metaData }) => {
  // Use filters from props, but keep local copy for editing
  const [filters, setFilters] = useState<Filter[]>(propFilters || []);
  const columns = useMemo(() => metaData, [metaData]);
  const fields = useMemo(() => {
    const result: Record<string, string> = {};
    metaData.forEach((col) => {
      result[col.field] = col.type;
    });
    return result;
  }, [metaData]);


   useEffect(() => {
    setFilters(propFilters || []);
  }, [propFilters]);
  

  // const [filters, setFilters] = useState<Filter[]>([]);
  const { showSnackbar } = useSnackbar();

  const [currentFilter, setCurrentFilter] = useState<Filter>({
    column: columns[0]?.field || "",
    operator: "contains",
    value: "",
  });

  const fieldType = fields[currentFilter.column] || "string";
  const operators = fieldType === "number" ? NUMBER_OPERATORS : STRING_OPERATORS;

  useEffect(() => {
    if (!columns.some((c) => c.field === currentFilter.column)) {
      setCurrentFilter({
        column: columns[0]?.field || "",
        operator: operators[0],
        value: "",
      });
    } else if (!operators.includes(currentFilter.operator)) {
      setCurrentFilter((prev) => ({
        ...prev,
        operator: operators[0],
        value: "",
      }));
    }
  }, [columns, currentFilter.column, currentFilter.operator, operators]);

  const handleChange = (field: keyof Filter, value: string) => {
    setCurrentFilter((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeFilters = (filters: Filter[]) =>
    filters.map((f) => ({
      ...f,
      value: f.operator === "is empty" ? "" : f.value,
    }));

  const handleAddFilter = () => {
    const colFilters = filters.filter((f) => f.column === currentFilter.column);

    if (
      (currentFilter.operator === "is empty" &&
        colFilters.some((f) => f.operator === "equals")) ||
      (currentFilter.operator === "equals" &&
        colFilters.some((f) => f.operator === "is empty"))
    ) {
      showSnackbar(
        `"${currentFilter.operator}" cannot be added because an "${
          currentFilter.operator === "is empty" ? "equals" : "is empty"
        }" filter already exists for "${currentFilter.column}". Remove it first.`,
        "error"
      );
      return;
    }

    const isAddingEqualsOrEmpty =
      currentFilter.operator === "equals" || currentFilter.operator === "is empty";
    const hasEqualsOrEmpty = colFilters.some(
      (f) => f.operator === "equals" || f.operator === "is empty"
    );
    const hasOtherStringOps = colFilters.some((f) =>
      ["contains", "starts with", "ends with", "greater than", "less than"].includes(f.operator)
    );

    if (isAddingEqualsOrEmpty && hasOtherStringOps) {
      showSnackbar(
        `Cannot add "${currentFilter.operator}" filter because other filters like "contains", "starts with", or "ends with" exist for "${currentFilter.column}". Remove them first.`,
        "error"
      );
      return;
    }

    if (!isAddingEqualsOrEmpty && hasEqualsOrEmpty) {
      showSnackbar(
        `Cannot add "${currentFilter.operator}" filter because an "equals" or "is empty" filter already exists for "${currentFilter.column}". Remove it first.`,
        "error"
      );
      return;
    }

    if (
      filters.some(
        (f) =>
          f.column === currentFilter.column && f.operator === currentFilter.operator
      )
    ) {
      return;
    }

    if (currentFilter.operator !== "is empty" && !currentFilter.value.trim()) {
      return;
    }

    if (fieldType === "number") {
      const val = parseFloat(currentFilter.value);
      const gtFilter = filters.find(
        (f) => f.column === currentFilter.column && f.operator === "greater than"
      );
      const ltFilter = filters.find(
        (f) => f.column === currentFilter.column && f.operator === "less than"
      );

      if (
        currentFilter.operator === "less than" &&
        gtFilter &&
        val <= parseFloat(gtFilter.value)
      ) {
        showSnackbar(
          `"Less than" must be greater than the "greater than" value (${gtFilter.value})`,
          "error"
        );
        return;
      }
      if (
        currentFilter.operator === "greater than" &&
        ltFilter &&
        val >= parseFloat(ltFilter.value)
      ) {
        showSnackbar(
          `"Greater than" must be less than the "less than" value (${ltFilter.value})`,
          "error"
        );
        return;
      }
    }

    setFilters((prev) => [...prev, currentFilter]);
    setCurrentFilter({
      column: currentFilter.column,
      operator: operators[0],
      value: "",
    });
  };

  const handleDeleteFilter = (index: number) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
  };

 const handleApply = () => {
  const normalized = normalizeFilters(filters);
  setFilters(normalized); // retain normalized filters locally
  onApplyFilters(normalized);
};

  return (
    <>
      <Box display="flex" gap={2} flexWrap="wrap" mb={1} alignItems="center">
        <TextField
          select
          label="Column"
          value={currentFilter.column}
          onChange={(e) => handleChange("column", e.target.value)}
          size="small"
          sx={{
            "& .MuiInputLabel-root": { color: "gray" },
            "& .MuiInputLabel-root.Mui-focused": { color: "gray" },
            "& .MuiOutlinedInput-root.Mui-focused > fieldset": { borderColor: "black" },
          }}
        >
          {columns.map((col) => (
            <MenuItem key={col.field} value={col.field}>
              {col.headerName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Operator"
          value={currentFilter.operator}
          onChange={(e) => handleChange("operator", e.target.value)}
          size="small"
          sx={{
            "& .MuiInputLabel-root": { color: "gray" },
            "& .MuiInputLabel-root.Mui-focused": { color: "gray" },
            "& .MuiOutlinedInput-root.Mui-focused > fieldset": { borderColor: "black" },
          }}
        >
          {operators.map((op) => (
            <MenuItem key={op} value={op}>
              {op}
            </MenuItem>
          ))}
        </TextField>

        {currentFilter.operator !== "is empty" && (
          <TextField
            label="Value"
            type={fieldType === "number" ? "number" : "text"}
            value={currentFilter.value}
            onChange={(e) => handleChange("value", e.target.value)}
            size="small"
            sx={{
              "& .MuiInputLabel-root": { color: "gray" },
              "& .MuiInputLabel-root.Mui-focused": { color: "gray" },
              "& .MuiOutlinedInput-root.Mui-focused > fieldset": { borderColor: "black" },
            }}
          />
        )}

        <Button
          variant="outlined"
          onClick={handleAddFilter}
          sx={{
            borderColor: "black",
            color: "black",
            "&:hover": { backgroundColor: "#333", color: "white" },
          }}
          disabled={
            (currentFilter.operator !== "is empty" && !currentFilter.value.trim()) ||
            filters.some(
              (f) => f.column === currentFilter.column && f.operator === currentFilter.operator
            )
          }
        >
          Add
        </Button>

        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            backgroundColor: "black",
            color: "white",
            "&:hover": { backgroundColor: "#333" },
          }}
        >
          Apply
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {filters.length === 0 ? (
          <Typography color="textSecondary" variant="body2">
            No filters added
          </Typography>
        ) : (
          filters.map((f, i) => (
            <Chip
              key={i}
              label={`${columns.find((c) => c.field === f.column)?.headerName || f.column} ${
                f.operator
              }${f.operator !== "is empty" ? ` "${f.value}"` : ""}`}
              onDelete={() => handleDeleteFilter(i)}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: "16px",
                color: "black",
                borderColor: "#ccc",
                "& .MuiChip-deleteIcon": { color: "black" },
              }}
            />
          ))
        )}
      </Box>
    </>
  );
};

export default CarFilter;
