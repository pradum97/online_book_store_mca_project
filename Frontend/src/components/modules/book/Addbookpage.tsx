"use client";

import React, { useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  FormProvider,
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import ButtonRFH from "@lib/ButtonRFH";
import { Grid } from "@mui/material";
import {
  CreateBookEP,
  GetBookByIdEP,
  GetBookEditDataEP,
  GetCategoriesEP,
  GetUOMsEP,
  UpdateBookEP,
} from "@webEndPoints/handlers/bookWEB/bookWEB";
import { useQuery } from "@tanstack/react-query";
import {
  IGetCategoriesEP,
  IGetUOMsEP,
} from "@webEndPoints/handlers/bookWEB/IbookWEB";
import { toast } from "react-toastify";
import { ca, fi } from "date-fns/locale";

export interface UOMEntry {
  uom_id: string;
  base_quantity: number | string;
  is_default: boolean;
}

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
        p: 1,
        background: "#fafafa",
        mb: 1,
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

export interface BookFormValues {
  title: string;
  author: string;
  category_id: string;
  description: string;
  uoms: UOMEntry[];
}

const defaultVal: BookFormValues = {
  title: "",
  author: "",
  category_id: "",
  description: "",
  uoms: [{ uom_id: "", base_quantity: "", is_default: true }],
};

interface AddBookPageProps {
  book_id?: string;
  onSuccess?: () => void;
}

export default function AddBookPage({ book_id, onSuccess }: AddBookPageProps) {
  const isEditMode = !!book_id;

  const [isLoading, setIsLoading] = React.useState(false);
  const methods = useForm<BookFormValues>({ defaultValues: defaultVal });
  const { control, watch, setValue, getValues, reset } = methods;
  const { fields } = useFieldArray({ control, name: "uoms" });
  const watchedUoms = watch("uoms");

  const { data: categoriesList } = useQuery<IGetCategoriesEP[]>({
    queryKey: ["GetCategoriesEP"],
    queryFn: async () => {
      const res = await GetCategoriesEP();
      return res?.data ?? [];
    },
  });

  const {
    data: uomsList,
    isLoading: isLoadingUOMs,
    isError: isErrorUOMs,
    refetch: refetchUOMs,
    isFetching: isFetchingUOMs,
  } = useQuery<IGetUOMsEP[]>({
    queryKey: ["GetUOMsEP"],
    queryFn: async () => {
      const res = await GetUOMsEP();
      return res?.data ?? [];
    },
  });

  const { data: bookDetails, isLoading: isBookLoading } = useQuery({
    queryKey: ["GetBookEditDataEP", book_id],
    queryFn: async () => {
      const res = await GetBookEditDataEP(book_id!);
      return res?.data;
    },
    enabled: !!book_id,
  });

  useEffect(() => {
    if (uomsList?.length && !getValues("uoms.0.uom_id")) {
      setValue("uoms.0.uom_id", uomsList[0].uom_id);

      if (uomsList[0]?.uom_code === "PCS") {
        setValue("uoms.0.base_quantity", 1);
      }
    }
  }, [uomsList]);

  useEffect(() => {
    if (isEditMode && bookDetails) {
      reset({
        title: bookDetails.title || "",
        author: bookDetails.author || "",
        category_id: bookDetails.category_id || "",
        description: bookDetails.description || "",
        uoms: bookDetails.uom_list?.length
          ? bookDetails.uom_list
          : [{ uom_id: "", base_quantity: "", is_default: true }],
      });
    }
  }, [isEditMode, bookDetails]);

  const handleUomChange = (index: number, uomId: string) => {
    setValue(`uoms.${index}.uom_id`, uomId);
    const selected = uomsList?.find((u) => u.uom_id === uomId);
    if (selected?.uom_code === "PCS") {
      setValue(`uoms.${index}.base_quantity`, 1);
    } else {
      const current = getValues(`uoms.${index}.base_quantity`);
      if (current === 1) setValue(`uoms.${index}.base_quantity`, "");
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        uoms: data.uoms.map((u) => ({
          ...u,
          base_quantity: Number(u.base_quantity),
        })),
      };
      console.log(
        "isEditMode-",
        isEditMode ? "UPDATE 📝" : "CREATE 📚",
        payload,
      );

      const res = isEditMode
        ? await UpdateBookEP(book_id!, payload)
        : await CreateBookEP(payload);
      if (res?.action === "success") {
        onSuccess?.();
      }
      toast[res?.action as "success"](res.message ?? res?.title);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditMode && isBookLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress size={"40px"} />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <SectionCard label="Book Information">
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <TextFieldRFH
                  name="title"
                  label="Book Title"
                  rules={{ required: "Please enter a title" }}
                  case="TITLE"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextFieldRFH
                  name="author"
                  label="Author"
                  rules={{ required: "Please enter an author" }}
                  case="TITLE"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SelectRFH
                  name="category_id"
                  label="Category"
                  rules={{ required: "Please select a category" }}
                >
                  {(categoriesList ?? []).map((c) => (
                    <MenuItem key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </MenuItem>
                  ))}
                </SelectRFH>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextFieldRFH
                  name="description"
                  label="Description"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            label="Unit of Measurement (UOM)"
            // extra={
            //   <Box
            //     component="button"
            //     type="button"
            //     onClick={() =>
            //       append({ uom_id: "", base_quantity: "", is_default: false })
            //     }
            //     sx={{
            //       display: "inline-flex",
            //       alignItems: "center",
            //       gap: 0.5,
            //       px: 1.4,
            //       py: 0.4,
            //       borderRadius: "8px",
            //       background: "#f5f3ff",
            //       border: "1.5px solid #c4b5fd",
            //       color: "#6d28d9",
            //       fontFamily: "'Nunito', sans-serif",
            //       fontWeight: 700,
            //       fontSize: 12,
            //       cursor: "pointer",
            //       transition: "all 0.15s",
            //       "&:hover": { background: "#ede9fe" },
            //     }}
            //   >
            //     <AddCircleOutlineIcon sx={{ fontSize: 14 }} />
            //     Add UOM
            //   </Box>
            // }
          >
            {/* Info banner */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                mb: 1,
                p: "10px 14px",
                borderRadius: "10px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 14,
                  color: "#3b82f6",
                  mt: "1px",
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontFamily: "'Nunito', sans-serif",
                  lineHeight: 1.5,
                  color: "#374151",
                }}
              >
                <b>Base Quantity</b> defines how many base units are in this
                UOM. For <b>Unit</b>, it is always <b>1</b> (read-only). For{" "}
                <b>Box / Carton / Pack</b>, enter how many units fit inside —
                e.g., Box of 10 units = base qty <b>10</b>.
              </Typography>
            </Box>

            {/* UOM Rows */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {fields.map((field, index) => {
                const selectedUomId = watchedUoms[index]?.uom_id;
                const selectedUom = uomsList?.find(
                  (u) => u.uom_id === selectedUomId,
                );
                const isUnit = selectedUom?.uom_code === "PCS";
                const baseQty = watchedUoms[index]?.base_quantity;

                console.log("selectedUom-", "-", isUnit, "-", selectedUom);

                return (
                  <Box key={field.id}>
                    {index > 0 && (
                      <Divider sx={{ mb: 1.5, borderColor: "#e5e7eb" }} />
                    )}

                    <Grid container spacing={1.5} alignItems="flex-start">
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name={`uoms.${index}.uom_id`}
                          control={control}
                          rules={{ required: "UOM is required" }}
                          render={() => (
                            <SelectRFH
                              name={`uoms.${index}.uom_id`}
                              label="UOM"
                              rules={{ required: "UOM is required" }}
                              onChange={(e: any) =>
                                handleUomChange(index, e.target.value)
                              }
                            >
                              {(uomsList ?? []).map((u) => (
                                <MenuItem
                                  key={u.uom_id}
                                  value={u.uom_id}
                                  disabled={watchedUoms?.some(
                                    (w, wi) =>
                                      wi !== index && w.uom_id === u.uom_id,
                                  )}
                                >
                                  {u.uom_name} ({u.uom_code})
                                </MenuItem>
                              ))}
                            </SelectRFH>
                          )}
                        />
                      </Grid>

                      {/* Base Qty */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextFieldRFH
                          name={`uoms.${index}.base_quantity`}
                          label="Base Quantity"
                          type="number"
                          disabled={isUnit}
                          rules={{
                            required: "Required",
                            min: { value: 1, message: "Min 1" },
                          }}
                          helperText={
                            selectedUom && !isUnit && baseQty
                              ? `1 ${selectedUom?.uom_name} = ${baseQty} units`
                              : undefined
                          }
                          slotProps={{
                            formHelperText: {
                              sx: {
                                color: "#6366f1 !important",
                                fontWeight: 700,
                                fontSize: 11,
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          </SectionCard>

          {/* Submit */}
          <ButtonRFH type="submit" fullWidth loading={isLoading}>
            {isEditMode ? "Update Book →" : "Create Book →"}
          </ButtonRFH>
        </form>
      </Box>
    </FormProvider>
  );
}
