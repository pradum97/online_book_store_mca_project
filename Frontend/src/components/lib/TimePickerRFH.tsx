import * as React from "react";
import {
  useFormContext,
  Controller,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import {
  TimePicker,
  TimePickerProps,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FormControl, FormLabel, Tooltip } from "@mui/material";
import { libCommonSx } from "./LibCommonStyle";

export interface TimePickerRFHProps extends Omit<
  TimePickerProps,
  "name" | "onChange" | "value" | "renderInput"
> {
  name: string;
  rules?: RegisterOptions<FieldValues, string>;
  label: string;
  minDate?: Date;
}

const TimePickerRFH: React.FC<TimePickerRFHProps> = ({
  name,
  rules,
  label,
  minDate,
  ...timePickerProps
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
              {/* Wrap the TimePicker in a div to forward ref and handle mouse events */}
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <TimePicker
                  {...timePickerProps}
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(time) => {
                    field.onChange(time?.toISOString() ?? null);
                  }}
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

export default React.memo(TimePickerRFH);
TimePickerRFH.displayName = "TimePickerRFH";
