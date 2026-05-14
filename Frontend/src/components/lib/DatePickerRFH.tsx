import * as React from "react";
import {
  useFormContext,
  Controller,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import {
  DatePicker,
  DatePickerProps,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FormControl, FormLabel, Tooltip } from "@mui/material";
import { libCommonSx } from "./LibCommonStyle";
import { PickerValue } from "@mui/x-date-pickers/internals";

export interface DatePickerRFHProps extends Omit<
  DatePickerProps,
  "name" | "onChange" | "value" | "renderInput"
> {
  name: string;
  rules?: RegisterOptions<FieldValues, string>;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePickerRFH: React.FC<DatePickerRFHProps> = ({
  name,
  rules = {},
  label,
  minDate,
  maxDate,
  ...datePickerProps
}) => {
  const { control } = useFormContext();
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => setShowTooltip(true), []);
  const handleMouseLeave = React.useCallback(() => setShowTooltip(false), []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <FormControl fullWidth error={!!fieldState.error}>
            <FormLabel htmlFor={name} sx={libCommonSx}>
              {label}
              {rules?.required ? <span style={{ color: "red" }}> *</span> : ""}
            </FormLabel>

            <Tooltip
              title={fieldState.error?.message}
              open={showTooltip && !!fieldState.error?.message}
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
              {/* Wrap the DatePicker in a span to correctly forward props */}
              <span
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  {...datePickerProps}
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  maxDate={maxDate ? dayjs(maxDate) : undefined}
                  onChange={(date: PickerValue) => {
                    field.onChange(date ? dayjs(date).toISOString() : null);
                  }}
                  minDate={minDate ? dayjs(minDate) : undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      onBlur: () => {
                        field.onBlur();
                        setShowTooltip(false);
                      },
                      onFocus: () => {
                        if (!!fieldState.error) setShowTooltip(true);
                      },
                      InputLabelProps: {
                        style: { display: "none" },
                      },
                      sx: {
                        "& .MuiPickersInputBase-root": {
                          padding: "1px 7px",
                          paddingRight: "10px",
                        },
                        "& .MuiPickersSectionList-root": {
                          height: 24,
                          padding: "5px 0px",
                          fontSize: "13px",
                        },
                        "& .MuiButtonBase-root": {
                          padding: "4.5px 10px !important",
                          color: !!fieldState.error ? "red" : "inherit",
                          "& .MuiSvgIcon-root": {
                            height: "0.7em",
                            width: "0.7em",
                          },
                        },
                      },
                    },
                  }}
                />
              </span>
            </Tooltip>
          </FormControl>
        )}
      />
    </LocalizationProvider>
  );
};

export default React.memo(DatePickerRFH);
DatePickerRFH.displayName = "DatePickerRFH";
