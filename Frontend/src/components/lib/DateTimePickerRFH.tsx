import * as React from "react";
import {
  useFormContext,
  Controller,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import {
  DateTimePicker,
  DateTimePickerProps,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FormControl, FormLabel, Tooltip } from "@mui/material";
import { libCommonSx } from "./LibCommonStyle";
import { PickerValue } from "@mui/x-date-pickers/internals";

export interface DateTimePickerRFHProps
  extends Omit<
    DateTimePickerProps,
    "name" | "onChange" | "value" | "renderInput"
  > {
  name: string;
  rules?: RegisterOptions<FieldValues, string>;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DateTimePickerRFH: React.FC<DateTimePickerRFHProps> = ({
  name,
  rules = {},
  label,
  minDate,
  maxDate,
  ...dateTimePickerProps
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
              <div>
                <DateTimePicker
                  {...dateTimePickerProps}
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date: PickerValue) => {
                    field.onChange(date ? dayjs(date).toISOString() : null);
                  }}
                  maxDate={maxDate ? dayjs(maxDate) : undefined}
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
                      onMouseEnter: handleMouseEnter,
                      onMouseLeave: handleMouseLeave,
                      sx: {
                        "& .MuiPickersSectionList-root": {
                          height: 24,
                          padding: "4px 1px",
                          fontSize: "13px",
                        },
                        "& .MuiButtonBase-root": {
                          height: "26px",
                          color: !!fieldState.error ? "red" : "inherit",
                          "& .MuiSvgIcon-root": {
                            height: "0.8em",
                            width: "0.8em",
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </Tooltip>
          </FormControl>
        )}
      />
    </LocalizationProvider>
  );
};

export default React.memo(DateTimePickerRFH);
DateTimePickerRFH.displayName = "DateTimePickerRFH";
