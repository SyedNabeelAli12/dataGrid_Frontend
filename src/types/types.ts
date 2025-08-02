export interface HeaderProps {
  content?: string;
}

export interface InfoCardItem {
  label: string;
  value: string | number;
}


export interface LOVItem {
  id: number;
  name: string;
}


export interface SearchBarProps {
  value: string;
  onChange: (newValue: string) => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
}


export interface InfoCardProps {
  items: { label: string; value: string | number }[];
}

export interface LOVData {
  powertrains: LOVItem[];
  bodyStyles: LOVItem[];
  plugTypes: LOVItem[];
}

export interface LOVContextType {
  lovs: LOVData | null;
  loading: boolean;
}


export type Filter = {
  column: string;
  operator: string;
  value: string;
};

export interface CarFilterProps {
  onApplyFilters: (filters: Filter[]) => void;
  columns: { field: string; headerName: string }[];
  fields: { [key: string]: "string" | "number" };
}