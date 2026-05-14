"use client";

import React, { useState } from "react";
import {
  useFormContext,
  Controller,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import {
  TextField,
  TextFieldProps,
  Tooltip,
  IconButton,
  FormLabel,
  FormControl,
  SxProps,
  OutlinedInput,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { libCommonSx } from "./LibCommonStyle";

export type TextCase = "SENTENCE" | "TITLE" | "UPPER" | "LOWER";

export interface TextFieldRFHProps extends Omit<TextFieldProps, "name"> {
  name: string;
  rules?: RegisterOptions<FieldValues, string>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  label: string;
  case?: TextCase;
  tefieldSx?: SxProps;
}

const transformCase = (value: string, caseType?: TextCase): string => {
  if (!value) return "";
  switch (caseType) {
    case "SENTENCE":
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    case "TITLE":
      return value.replace(
        /\w\S*/g,
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      );
    case "UPPER":
      return value.toUpperCase();
    case "LOWER":
      return value.toLowerCase();
    default:
      return value;
  }
};

const TextFieldRFH: React.FC<TextFieldRFHProps> = ({
  name,
  rules,
  startAdornment,
  endAdornment,
  label,
  case: caseType,
  tefieldSx,
  ...textFieldProps
}) => {
  const { control } = useFormContext();
  const [showTooltip, setShowTooltip] = useState(false);

  const combinedRules: RegisterOptions<FieldValues, string> = {
    ...rules,
    validate: (value: string) => {
      if (rules?.required) {
        if (!value || (value ?? "").toString().trim() === "") {
          return typeof rules.required === "string"
            ? rules.required
            : "This field is required";
        }
      }
      if (rules?.validate) {
        if (typeof rules.validate === "function") {
          return rules.validate(value, {});
        }
        if (typeof rules.validate === "object") {
          for (const key in rules.validate) {
            if (Object.prototype.hasOwnProperty.call(rules.validate, key)) {
              const result = rules.validate[key](value, {});
              if (result !== true) return result;
            }
          }
        }
      }
      return true;
    },
  };
  return (
    <Controller
      name={name}
      control={control}
      rules={combinedRules}
      render={({ field, fieldState }) => {
        const showError = !!fieldState.error;
        const errorMessage = fieldState.error?.message || "";

        return (
          <FormControl fullWidth error={!!fieldState.error}>
            {label && label !== "" && (
              <FormLabel htmlFor={name} sx={libCommonSx}>
                {label}
                {rules?.required ? (
                  <span style={{ color: "red" }}> *</span>
                ) : (
                  ""
                )}
              </FormLabel>
            )}

            <OutlinedInput
              {...field}
              value={transformCase(field.value, caseType) ?? ""}
              fullWidth
              size="small"
              error={showError}
              onFocus={(e) => {
                textFieldProps.onFocus?.(e);
                if (showError) setShowTooltip(true);
              }}
              onBlur={(e) => {
                textFieldProps.onBlur?.(e);
                setShowTooltip(false);
              }}
              onChange={(e) => {
                const value = transformCase(e.target.value, caseType);
                field.onChange(value);
              }}
              startAdornment={startAdornment}
              endAdornment={
                <React.Fragment>
                  {showError ? (
                    <Tooltip
                      title={errorMessage}
                      open={showTooltip}
                      placement="top"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "error.main",
                            color: "#fff",
                            fontSize: "0.75rem",
                            p: 0.5,
                          },
                        },
                        arrow: {
                          sx: {
                            color: "error.main",
                          },
                        },
                      }}
                    >
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="error info"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        <ErrorOutlineIcon
                          color="error"
                          sx={{ fontSize: "17px" }}
                        />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    endAdornment
                  )}
                </React.Fragment>
              }
              sx={{
                ...(tefieldSx as SxProps),
              }}
              placeholder={textFieldProps?.placeholder ?? label}
              disabled={textFieldProps?.disabled ?? false}
            />
          </FormControl>
        );
      }}
    />
  );
};

export default React.memo(TextFieldRFH);
TextFieldRFH.displayName = "TextFieldRFH";
