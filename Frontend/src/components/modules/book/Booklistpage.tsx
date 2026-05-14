"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { CellStyle, ColDef, ICellRendererParams } from "ag-grid-community";
import PageContainer from "@container/Pagecontainer";
import { agGridTheme } from "@appearance/agGridThemes";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { toast } from "react-toastify";
import {
  IGetCategoriesEP,
  IGetSellerBookListEP,
} from "@webEndPoints/handlers/bookWEB/IbookWEB";
import ImageUploadModal from "./ImageUploadModal";
import ImagePreviewModal from "./ImagePreviewModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import {
  GetSellerBookListEP,
  DeleteBookEP,
  GetCategoriesEP,
} from "@webEndPoints/handlers/bookWEB/bookWEB";
import AddBookModal from "./AddBookModal";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import { FormProvider, useForm } from "react-hook-form";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function uploadBookImages(bookId: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  const res = await fetch(`${API_BASE}/api/v1/book/books/${bookId}/images`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (json?.action !== "success")
    throw new Error(json?.message || "Upload failed");
}

async function deleteBookImage(imageId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/book/books/images/${imageId}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (json?.action !== "success")
    throw new Error(json?.message || "Delete failed");
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

interface ImagesCellRendererProps extends ICellRendererParams<IGetSellerBookListEP> {
  onPreview: (book: IGetSellerBookListEP) => void;
}

const ImagesCellRenderer = (params: ImagesCellRendererProps) => {
  const { data, onPreview } = params;
  if (!data) return null;
  const count = data.images.length;

  if (count === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 11,
            color: "#9ca3af",
            fontStyle: "italic",
          }}
        >
          No images
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%", gap: 1 }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexShrink: 0,
          width: `${Math.min(count, 3) * 16 + 10}px`,
          height: 26,
          minWidth: 60,
        }}
      >
        {data.images.slice(0, 3).map((img, idx) => (
          <Box
            key={img.image_id}
            sx={{
              width: 26,
              height: 26,
              borderRadius: "6px",
              overflow: "hidden",
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              position: "absolute",
              left: `${idx * 14}px`,
              zIndex: 3 - idx,
            }}
          >
            <Box
              component="img"
              src={img.image_url}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
            />
          </Box>
        ))}
      </Box>
      <Tooltip title="Preview images" placement="top">
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onPreview(data);
          }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.2,
            py: 0.3,
            borderRadius: "20px",
            background: "#eff6ff",
            border: "1.5px solid #bfdbfe",
            cursor: "pointer",
            "&:hover": { background: "#dbeafe" },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11,
              fontWeight: 800,
              color: "#1d4ed8",
            }}
          >
            {count} photo{count !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

interface ActionCellRendererProps extends ICellRendererParams<IGetSellerBookListEP> {
  onEdit: (book: IGetSellerBookListEP) => void;
  onDelete: (book: IGetSellerBookListEP) => void;
  onAddImage: (book: IGetSellerBookListEP) => void;
  loadingBookId: string | null;
}

const ActionCellRenderer = (params: ActionCellRendererProps) => {
  const { data, onEdit, onDelete, onAddImage, loadingBookId } = params;
  if (!data) return null;

  if (loadingBookId === data.book_id) {
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", height: "100%", pl: 1 }}
      >
        <CircularProgress size={16} sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", height: "100%", gap: 0.8 }}
    >
      <Tooltip title="Add images" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onAddImage(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            color: "#15803d",
            "&:hover": { background: "#dcfce7", borderColor: "#86efac" },
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      {/* Edit */}
      <Tooltip title="Edit book" placement="top">
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

      {/* Delete */}
      <Tooltip title="Delete book" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#fff1f2",
            border: "1.5px solid #fecdd3",
            color: "#be123c",
            "&:hover": { background: "#ffe4e6", borderColor: "#fda4af" },
          }}
        >
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const CategoryCellRenderer = (
  params: ICellRendererParams<IGetSellerBookListEP>,
) => {
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
          {params.data.category_name}
        </Typography>
      </Box>
    </Box>
  );
};

const DescriptionCellRenderer = (
  params: ICellRendererParams<IGetSellerBookListEP>,
) => {
  if (!params.data) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Tooltip title={params.data.description} placement="top">
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 12,
            color: "#374151",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 220,
          }}
        >
          {params.data.description}
        </Typography>
      </Tooltip>
    </Box>
  );
};

export default function BookList() {
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<IGetSellerBookListEP | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editBook, setEditBook] = useState<IGetSellerBookListEP | null>(null);
  const [uploadBook, setUploadBook] = useState<IGetSellerBookListEP | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<IGetSellerBookListEP | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const methods = useForm({
    defaultValues: {
      search: "",
      categoryFilter: 0,
    },
  });

  const { watch } = methods;
  const searchText = watch("search");
  const categoryFilter = watch("categoryFilter");

  const {
    data: booksResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["IGetSellerBookListEP"],
    queryFn: async () => {
      const res = await GetSellerBookListEP();
      return res ?? [];
    },
  });

  console.log("IGetSellerBookListEP-", booksResponse);

  const books: IGetSellerBookListEP[] = booksResponse?.data ?? [];
  const queryClient = useQueryClient();

  const handleEdit = useCallback((book: IGetSellerBookListEP) => {
    setEditBook(book);
    setAddModalOpen(true);
  }, []);

  const categoryOptions = useMemo(() => {
    const map = new Map();

    books.forEach((b) => {
      if (b.category_id && !map.has(b.category_id)) {
        map.set(b.category_id, b.category_name);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({
      category_id: id,
      category_name: name,
    })) as IGetCategoriesEP[];
  }, [books]);

  const handleDeleteClick = useCallback(
    (book: IGetSellerBookListEP) => setDeleteTarget(book),
    [],
  );

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch = b.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

      const matchCategory = categoryFilter
        ? b?.category_id === categoryFilter
        : true;

      return matchSearch && matchCategory;
    });
  }, [books, searchText, categoryFilter]);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await DeleteBookEP(deleteTarget.book_id);

      toast[res?.action as "success"](res.message ?? res?.title);
      queryClient.invalidateQueries({ queryKey: ["IGetSellerBookListEP"] });
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, queryClient]);

  const handlePreview = useCallback(
    (book: IGetSellerBookListEP) => setPreviewBook(book),
    [],
  );
  const handleAddImage = useCallback(
    (book: IGetSellerBookListEP) => setUploadBook(book),
    [],
  );
  const handleOpenAddModal = useCallback(() => {
    setEditBook(null);
    setAddModalOpen(true);
  }, []);
  const handleCloseAddModal = useCallback(() => {
    setAddModalOpen(false);
    setEditBook(null);
  }, []);

  const columnDefs = useMemo<ColDef<IGetSellerBookListEP>[]>(
    () => [
      {
        headerName: "#",
        width: 50,
        sortable: false,
        filter: false,
        pinned: "left",
        valueGetter: (p) => Number(p?.node?.rowIndex ?? 0) + 1,
      },
      {
        headerName: "Title",
        field: "title",
        minWidth: 200,
        flex: 1,
        pinned: "left",
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
        width: 140,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "#374151",
        },
      },
      {
        headerName: "Category",
        field: "category_name",
        width: 180,
        cellRenderer: CategoryCellRenderer,
      },
      {
        headerName: "Description",
        field: "description",
        minWidth: 220,
        flex: 1,
      },
      {
        headerName: "Images",
        field: "images",
        width: 170,
        sortable: false,
        cellRenderer: ImagesCellRenderer,
        cellRendererParams: { onPreview: handlePreview },
        resizable: false,
      },
      {
        headerName: "Action",
        width: 145,
        sortable: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onEdit: handleEdit,
          onDelete: handleDeleteClick,
          onAddImage: handleAddImage,
          loadingBookId,
        },
      },
    ],
    [
      handleEdit,
      handleDeleteClick,
      handleAddImage,
      handlePreview,
      loadingBookId,
    ],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      suppressMovable: false,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    [],
  );

  return (
    <>
      <PageContainer
        title="Book List"
        subtitle="Manage your books — add, edit or remove entries"
        icon={<MenuBookIcon sx={{ color: "#6366f1" }} />}
        actions={
          <FormProvider {...methods}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ width: 220 }}>
                <TextFieldRFH
                  name="search"
                  label=""
                  placeholder="Search Book..."
                />
              </Box>

              <Box sx={{ width: 180 }}>
                <SelectRFH
                  name="categoryFilter"
                  label=""
                  placeholder="Category"
                >
                  {[
                    <MenuItem key="all" value="">
                      All
                    </MenuItem>,

                    ...categoryOptions.map((c) => (
                      <MenuItem key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </MenuItem>
                    )),
                  ]}
                </SelectRFH>
              </Box>

              <Box
                component="button"
                onClick={handleOpenAddModal}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 1,
                  py: 0.5,
                  borderRadius: "5px",
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
                Add Book
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
                    p: 0.6,
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
                Failed to load books
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
              <AgGridReact<IGetSellerBookListEP>
                rowData={filteredBooks}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                loading={isLoading || isFetching}
                overlayLoadingTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#6366f1;font-size:14px;">⏳ Loading books...</span>`}
                overlayNoRowsTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#9ca3af;font-size:14px;">📚 No books found</span>`}
                animateRows={true}
                suppressCellFocus={false}
                getRowId={(p) => p.data.book_id}
                gridOptions={{ theme: agGridTheme }}
                suppressClickEdit={true}
              />
            </div>
          )}
        </Box>
      </PageContainer>

      <ImagePreviewModal
        open={!!previewBook}
        images={previewBook?.images ?? []}
        bookTitle={previewBook?.title ?? ""}
        onClose={() => setPreviewBook(null)}
        onImageDeleted={() =>
          queryClient.invalidateQueries({ queryKey: ["IGetSellerBookListEP"] })
        }
      />

      <ImageUploadModal
        open={!!uploadBook}
        book={uploadBook}
        onClose={() => setUploadBook(null)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["IGetSellerBookListEP"] })
        }
      />

      <AddBookModal
        open={addModalOpen}
        editData={editBook}
        onClose={handleCloseAddModal}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["IGetSellerBookListEP"] })
        }
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        message="This book and all its data will be permanently removed. This action cannot be undone."
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </>
  );
}
