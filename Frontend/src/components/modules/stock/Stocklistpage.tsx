"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { CellStyle, ColDef, ICellRendererParams } from "ag-grid-community";
import PageContainer from "@container/PageContainer";
import { agGridTheme } from "@appearance/agGridThemes";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { FormProvider, useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import ButtonRFH from "@lib/ButtonRFH";
import {
  CreateStockEP,
  GetSellerStockEP,
  UpdateStockEP,
} from "@webEndPoints/handlers/stockWEB/stockWEB";
import { ISTOCK_TYPE, STOCK_TYPE } from "@container/navbar/RoleRenderer";
import AutocompleteRFH from "@lib/AutocompleteRFH";
import {
  GetBookUOMsEP,
  GetSellerBookListEP,
} from "@webEndPoints/handlers/bookWEB/bookWEB";

export const STOCK_TYPE_OPTIONS = [
  { label: "All", value: STOCK_TYPE.ALL },
  { label: "Low (< 10)", value: STOCK_TYPE.LOW },
  { label: "Out (0)", value: STOCK_TYPE.OUT },
];

export interface IStockRow {
  stock_id: string;
  quantity: number;
  mrp: string;
  purchase_rate: string;
  is_default_stock: boolean;
  book_id: string;
  title: string;
  author: string;
  uom_name: string;
  uom_code: string;
}

interface AddStockForm {
  book_id: string;
  book_uom_id: string;
  quantity: number | string;
  mrp: number | string;
  purchase_rate: number | string;
  is_default_stock: string;
}

interface UpdateStockForm {
  quantity: number | string;
  mrp: number | string;
  purchase_rate: number | string;
  is_default_stock: string;
}

const IconRefresh = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        color: "#6366f1",
        mb: 1.2,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {children}
    </Typography>
  );
}

function SectionCard({
  label,
  children,
  extra,
}: {
  label: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1.5px solid #e5e7eb",
        borderRadius: "14px",
        p: 2,
        background: "#fafafa",
        mb: 1.5,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <SectionLabel>{label}</SectionLabel>
        {extra}
      </Box>
      {children}
    </Box>
  );
}

function AddStockModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<AddStockForm>({
    defaultValues: {
      book_id: "",
      book_uom_id: "",
      quantity: "",
      mrp: "",
      purchase_rate: "",
      is_default_stock: "true",
    },
  });

  const { watch, getValues, setValue } = methods;
  const selectedBookId = watch("book_id");

  const { data: booksList } = useQuery({
    queryKey: ["GetBooksForStockEP"],
    queryFn: async () => {
      const res = await GetSellerBookListEP();
      return res?.data ?? [];
    },
    enabled: open,
  });

  const { data: uomsList } = useQuery({
    queryKey: ["GetBookUOMsEP", selectedBookId],
    queryFn: async () => {
      const res = await GetBookUOMsEP(selectedBookId);
      return res?.data ?? [];
    },
    enabled: !!selectedBookId,
  });

  React.useEffect(() => {
    if (uomsList?.length && !getValues("book_uom_id")) {
      setValue("book_uom_id", uomsList[0].book_uom_id);
    }
  }, [uomsList]);

  const onSubmit = async (data: AddStockForm) => {
    try {
      setIsLoading(true);
      const payload = {
        book_id: data.book_id,
        book_uom_id: data.book_uom_id,
        quantity: Number(data.quantity),
        mrp: Number(data.mrp),
        purchase_rate: Number(data.purchase_rate),
        is_default_stock: data.is_default_stock === "true",
      };
      const res = await CreateStockEP(payload);
      toast[res?.action as "success"](res.message ?? res?.title);
      if (res?.action === "success") {
        onSuccess();
        onClose();
        methods.reset();
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "24px",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 20 }}>📦</Typography>
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
            }}
          >
            Add Stock
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#a5b4fc",
            "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowX: "hidden" }}>
        <FormProvider {...methods}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <SectionCard label="Book Details">
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <SelectRFH
                      name="book_id"
                      label="Select Book"
                      rules={{ required: "Book is required" }}
                    >
                      {(booksList ?? []).map((b: any) => (
                        <MenuItem key={b.book_id} value={b.book_id}>
                          {b.title}
                        </MenuItem>
                      ))}
                    </SelectRFH>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <SelectRFH
                      name="book_uom_id"
                      label="UOM"
                      rules={{ required: "UOM is required" }}
                    >
                      {(uomsList ?? []).map((u: any) => (
                        <MenuItem key={u.book_uom_id} value={u.book_uom_id}>
                          {u.uom_name} ({u.uom_code})
                        </MenuItem>
                      ))}
                    </SelectRFH>
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard label="Stock Details">
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="quantity"
                      label="Quantity"
                      type="number"
                      rules={{
                        required: "Required",
                        min: { value: 0, message: "Min 0" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="purchase_rate"
                      label="Purchase Rate (₹)"
                      type="number"
                      rules={{
                        required: "Required",
                        min: { value: 0, message: "Min 0" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="mrp"
                      label="MRP (₹)"
                      type="number"
                      rules={{
                        required: "Required",
                        min: { value: 0, message: "Min 0" },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <SelectRFH
                      name="is_default_stock"
                      label="Is Default Stock"
                      rules={{ required: "Required" }}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </SelectRFH>
                  </Grid>
                </Grid>
              </SectionCard>

              <ButtonRFH type="submit" fullWidth loading={isLoading}>
                Create Stock →
              </ButtonRFH>
            </form>
          </Box>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function UpdateStockModal({
  open,
  onClose,
  stockData,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  stockData: IStockRow | null;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<UpdateStockForm>({
    defaultValues: {
      quantity: "",
      mrp: "",
      purchase_rate: "",
      is_default_stock: "true",
    },
  });

  React.useEffect(() => {
    if (open && stockData) {
      methods.reset({
        quantity: stockData.quantity,
        mrp: stockData.mrp,
        purchase_rate: stockData.purchase_rate,
        is_default_stock: stockData.is_default_stock ? "true" : "false",
      });
    }
  }, [open, stockData]);

  const onSubmit = async (data: UpdateStockForm) => {
    if (!stockData) return;
    try {
      setIsLoading(true);
      const payload = {
        quantity: Number(data.quantity),
        mrp: Number(data.mrp),
        purchase_rate: Number(data.purchase_rate),
        is_default_stock: data.is_default_stock === "true",
      };
      const res = await UpdateStockEP(stockData.stock_id, payload);
      toast[res?.action as "success"](res.message ?? res?.title);
      if (res?.action === "success") {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "24px",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 20 }}>✏️</Typography>
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
            }}
          >
            Update Stock
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#a5b4fc",
            "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowX: "hidden" }}>
        {/* Book Info Banner */}
        {stockData && (
          <Box
            sx={{
              mx: 3,
              mt: 2,
              mb: 0,
              p: "10px 14px",
              borderRadius: "10px",
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#6b7280",
                  fontFamily: "'Nunito', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  fontWeight: 700,
                }}
              >
                Book
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#15803d",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {stockData.title}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#6b7280",
                  fontFamily: "'Nunito', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  fontWeight: 700,
                }}
              >
                UOM
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#15803d",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {stockData.uom_name} ({stockData.uom_code})
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#6b7280",
                  fontFamily: "'Nunito', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  fontWeight: 700,
                }}
              >
                Author
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#15803d",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {stockData.author}
              </Typography>
            </Box>
          </Box>
        )}

        <FormProvider {...methods}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <SectionCard label="Update Details">
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="quantity"
                      label="Quantity"
                      type="number"
                      rules={{
                        required: "Required",
                        min: { value: 0, message: "Min 0" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="mrp"
                      label="MRP (₹)"
                      type="number"
                      rules={{
                        required: "Required",
                        min: { value: 0, message: "Min 0" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="purchase_rate"
                      label="Purchase Rate (₹)"
                      type="number"
                      rules={{
                        required: "Required",
                        min: { value: 0, message: "Min 0" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <SelectRFH
                      name="is_default_stock"
                      label="Is Default Stock"
                      rules={{ required: "Required" }}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </SelectRFH>
                  </Grid>
                </Grid>
              </SectionCard>

              <ButtonRFH type="submit" fullWidth loading={isLoading}>
                Update Stock →
              </ButtonRFH>
            </form>
          </Box>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

const UOMCellRenderer = (params: ICellRendererParams<IStockRow>) => {
  if (!params.data) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Box
        sx={{
          display: "inline-flex",
          px: 1.4,
          py: 0.4,
          borderRadius: "20px",
          background: "#f5f3ff",
          border: "1.5px solid #c4b5fd60",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 11,
            fontWeight: 800,
            color: "#6d28d9",
          }}
        >
          {params.data.uom_name} ({params.data.uom_code})
        </Typography>
      </Box>
    </Box>
  );
};

const QtyCellRenderer = (params: ICellRendererParams<IStockRow>) => {
  if (!params.data) return null;
  const isZero = params.data.quantity === 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Box
        sx={{
          display: "inline-flex",
          px: 1.4,
          py: 0.4,
          borderRadius: "20px",
          background: isZero ? "#fff1f2" : "#f0fdf4",
          border: `1.5px solid ${isZero ? "#fecdd3" : "#bbf7d0"}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 12,
            fontWeight: 800,
            color: isZero ? "#be123c" : "#15803d",
          }}
        >
          {params.data.quantity}
        </Typography>
      </Box>
    </Box>
  );
};

const PriceCellRenderer = (
  params: ICellRendererParams<IStockRow> & { field: "mrp" | "purchase_rate" },
) => {
  if (!params.data) return null;
  const value = Number(params.data[params.field ?? "mrp"]).toFixed(2);
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        ₹ {value}
      </Typography>
    </Box>
  );
};

const DefaultCellRenderer = (params: ICellRendererParams<IStockRow>) => {
  if (!params.data) return null;
  if (params.data.is_default_stock) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.2,
            py: 0.3,
            borderRadius: "20px",
            background: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#15803d" }} />
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11,
              fontWeight: 800,
              color: "#15803d",
            }}
          >
            Default
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "#9ca3af",
        }}
      >
        —
      </Typography>
    </Box>
  );
};

interface ActionCellRendererProps extends ICellRendererParams<IStockRow> {
  onEdit: (stock: IStockRow) => void;
}

const ActionCellRenderer = (params: ActionCellRendererProps) => {
  const { data, onEdit } = params;
  if (!data) return null;
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", height: "100%", gap: 0.8 }}
    >
      <Tooltip title="Edit stock" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#eff6ff",
            border: "1.5px solid #bfdbfe",
            color: "#1d4ed8",
            "&:hover": { background: "#dbeafe", borderColor: "#93c5fd" },
          }}
        >
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

interface StockListPageProps {
  type: ISTOCK_TYPE;
}

export default function StockListPage({ type }: StockListPageProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<IStockRow | null>(null);

  const methods = useForm<{ type: ISTOCK_TYPE; bookFilter: any }>({
    defaultValues: {
      type: type || STOCK_TYPE.ALL,
      bookFilter: null,
    },
  });
  const watchType = methods.watch("type");
  const selectedBook = methods.watch("bookFilter");

  const queryClient = useQueryClient();

  const {
    data: stockResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["GetSellerStockEP"],
    queryFn: async () => {
      const res = await GetSellerStockEP();
      return res ?? [];
    },
  });

  const stocks: IStockRow[] = stockResponse?.data ?? [];

  const bookOptions = useMemo(() => {
    const map = new Map();

    stocks.forEach((s) => {
      const key = s.title?.toLowerCase();

      if (key && !map.has(key)) {
        map.set(key, {
          book_id: s.book_id,
          title: s.title,
          author: s.author,
        });
      }
    });

    return Array.from(map.values());
  }, [stocks]);
  const handleEdit = useCallback((stock: IStockRow) => {
    setSelectedStock(stock);
    setUpdateOpen(true);
  }, []);

  React.useEffect(() => {
    methods.setValue("type", type);
  }, [type]);

  const filteredStocks = useMemo(() => {
    let data = [...stocks];

    switch (watchType) {
      case STOCK_TYPE.LOW:
        data = data?.filter((s) => s.quantity > 0 && s.quantity < 10);
        break;
      case STOCK_TYPE.OUT:
        data = data?.filter((s) => s.quantity === 0);
        break;
    }

    if (selectedBook?.book_id) {
      data = data?.filter((s) => s.book_id === selectedBook.book_id);
    }

    return data;
  }, [stocks, watchType, selectedBook]);

  const columnDefs = useMemo<ColDef<IStockRow>[]>(
    () => [
      {
        headerName: "#",
        width: 55,
        sortable: false,
        filter: false,
        pinned: "left",
        valueGetter: (p) => Number(p?.node?.rowIndex ?? 0) + 1,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#6b7280",
        } as CellStyle,
      },
      {
        headerName: "Book Title",
        field: "title",
        width: 180,
        flex: 1,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#111827",
        } as CellStyle,
      },
      {
        headerName: "Author",
        field: "author",
        flex: 1,
        width: 140,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "#374151",
        } as CellStyle,
      },
      {
        headerName: "UOM",
        field: "uom_name",
        width: 160,
        cellRenderer: UOMCellRenderer,
      },
      {
        headerName: "Quantity",
        field: "quantity",
        width: 110,
        cellRenderer: QtyCellRenderer,
      },
      {
        headerName: "MRP (₹)",
        field: "mrp",
        width: 120,
        cellRenderer: PriceCellRenderer,
        cellRendererParams: { field: "mrp" },
      },
      {
        headerName: "Purchase Rate (₹)",
        field: "purchase_rate",
        width: 160,
        cellRenderer: PriceCellRenderer,
        cellRendererParams: { field: "purchase_rate" },
      },
      {
        headerName: "Default",
        field: "is_default_stock",
        width: 120,
        cellRenderer: DefaultCellRenderer,
        resizable: false,
      },
      {
        headerName: "Action",
        width: 90,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
        cellRendererParams: { onEdit: handleEdit },
      },
    ],
    [handleEdit],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: false,
      suppressMovable: false,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    [],
  );

  return (
    <>
      <PageContainer
        title="Stock List"
        subtitle="Manage inventory — add or update stock entries"
        icon={<Inventory2Icon sx={{ color: "#6366f1" }} />}
        actions={
          <FormProvider {...methods}>
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <Box sx={{ minWidth: 240 }}>
                <AutocompleteRFH
                  name="bookFilter"
                  label=""
                  options={bookOptions}
                  getOptionLabel={(option) => option?.title || ""}
                  isOptionEqualToValue={(opt, val) =>
                    opt.book_id === val.book_id
                  }
                  placeholder="🔍 Search Book..."
                  disableClearable={false}
                />
              </Box>
              <Box sx={{ minWidth: 160 }}>
                <SelectRFH name="type">
                  {STOCK_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </SelectRFH>
              </Box>

              <Box
                component="button"
                onClick={() => setAddOpen(true)}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 2,
                  py: 0.9,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5, #3730a3)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                <AddIcon sx={{ fontSize: 17 }} />
                Add Stock
              </Box>

              <Tooltip title="Refresh list">
                <IconButton
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    color: "#6366f1",
                    p: 1,
                    "&:hover": {
                      background: "#f5f3ff",
                      borderColor: "#6366f1",
                    },
                    animation: isFetching ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                >
                  <IconRefresh />
                </IconButton>
              </Tooltip>
            </Box>
          </FormProvider>
        }
      >
        <Box
          sx={{
            flex: 1,
            borderRadius: "14px",
            overflow: "hidden",
            height: "calc(100vh - 170px)",
            minHeight: 400,
          }}
        >
          {isError ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: 32 }}>⚠️</Typography>
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#ef4444",
                }}
              >
                Failed to load stock
              </Typography>
              <Box
                component="button"
                onClick={() => refetch()}
                sx={{
                  mt: 1,
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  "&:hover": { background: "#4f46e5" },
                }}
              >
                Retry
              </Box>
            </Box>
          ) : (
            <div
              style={{ height: "100%", width: "100%" }}
              className="ag-theme-alpine"
            >
              <AgGridReact<IStockRow>
                rowData={filteredStocks}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                loading={isLoading || isFetching}
                overlayLoadingTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#6366f1;font-size:14px;">⏳ Loading stock...</span>`}
                overlayNoRowsTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#9ca3af;font-size:14px;">📦 No stock found</span>`}
                animateRows={true}
                suppressCellFocus={false}
                getRowId={(p) => p.data.stock_id}
                gridOptions={{ theme: agGridTheme }}
                suppressClickEdit={true}
              />
            </div>
          )}
        </Box>
      </PageContainer>

      <AddStockModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["GetSellerStockEP"] })
        }
      />

      <UpdateStockModal
        open={updateOpen}
        onClose={() => {
          setUpdateOpen(false);
          setSelectedStock(null);
        }}
        stockData={selectedStock}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["GetSellerStockEP"] })
        }
      />
    </>
  );
}
