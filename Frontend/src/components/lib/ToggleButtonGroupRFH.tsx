"use client";

import * as React from "react";
import {
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  ToggleButtonProps,
  FormControl,
  FormLabel,
  Tooltip,
  Box,
  SxProps,
} from "@mui/material";
import {
  Controller,
  useFormContext,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";

interface ToggleButtonGroupRFHProps extends Omit<
  ToggleButtonGroupProps,
  "name" | "onChange"
> {
  name: string;
  label?: string;
  rules?: RegisterOptions<FieldValues, string>;
  children: React.ReactNode;
  sx?: SxProps;
}

const ToggleButtonGroupRFH: React.FC<ToggleButtonGroupRFHProps> = ({
  name,
  label,
  rules,
  children,
  sx,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const showError = !!fieldState.error;
        const errorMessage = fieldState.error?.message || "";

        return (
          <FormControl
            fullWidth
            error={showError}
            className="toggleFormControl"
          >
            {label && (
              <FormLabel>
                {label}
                {rules?.required && <span style={{ color: "red" }}> *</span>}
              </FormLabel>
            )}

            <Box position="relative" className="toggleContainer">
              <Tooltip
                title={errorMessage}
                open={showError ? true : false}
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
                <ToggleButtonGroup
                  {...props}
                  size="small"
                  value={field.value}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) field.onChange(newValue);
                  }}
                  sx={{
                    borderRadius: 1,
                    border: showError ? "1px solid red" : undefined,
                    "& .MuiButtonBase-root": (theme) => ({
                      padding: "4px",
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      },
                    }),
                    ...sx,
                  }}
                >
                  {React.Children.map(children, (child) => {
                    if (
                      React.isValidElement<ToggleButtonProps>(child) &&
                      typeof child.props.value !== "undefined"
                    ) {
                      return React.cloneElement(child, {
                        selected: field.value === child.props.value,
                      });
                    }
                    return child;
                  })}
                </ToggleButtonGroup>
              </Tooltip>
            </Box>
          </FormControl>
        );
      }}
    />
  );
};

export default React.memo(ToggleButtonGroupRFH);
ToggleButtonGroupRFH.displayName = "ToggleButtonGroupRFH";
