"use client";

import React, {
  ReactElement,
  Children,
  forwardRef,
  memo,
  HTMLAttributes,
} from "react";
import {
  useFormContext,
  Controller,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectProps,
  FormControl,
  MenuItemProps,
  OutlinedInput,
  FormLabel,
  Tooltip,
  SxProps,
} from "@mui/material";
import { VariableSizeList, ListChildComponentProps } from "react-window";
import { libCommonSx } from "./LibCommonStyle";

interface SelectRFHProps extends Omit<SelectProps, "name"> {
  name: string;
  label?: string;
  rules?: RegisterOptions<FieldValues, string>;
  children: ReactElement<MenuItemProps>[];
  itemHeight?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  maxVisibleItems?: number;
  placeholder?: string;
  selectSX?: SxProps;
}

const ITEM_HEIGHT = 32;

const renderRow =
  (children: ReactElement<MenuItemProps>[]) =>
  ({ index, style }: ListChildComponentProps) => {
    const child = children[index];
    return React.cloneElement(child, {
      style: {
        ...style,
        top: (style.top as number) + 8,
      },
    });
  };

const ListboxComponent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...rest } = props;
  const itemData = Children.toArray(children) as ReactElement<MenuItemProps>[];
  const itemCount = itemData.length;
  const height = Math.min(itemCount, 8) * ITEM_HEIGHT;

  return (
    <div ref={ref} {...rest}>
      <VariableSizeList
        height={height}
        width="100%"
        itemSize={() => ITEM_HEIGHT}
        itemCount={itemCount}
        overscanCount={5}
      >
        {renderRow(itemData)}
      </VariableSizeList>
    </div>
  );
});

ListboxComponent.displayName = "ListboxComponent";

const SelectRFH: React.FC<SelectRFHProps> = ({
  name,
  label,
  rules,
  children,
  startAdornment,
  endAdornment,
  placeholder,
  selectSX,
  ...selectProps
}) => {
  const { control } = useFormContext();
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => setShowTooltip(true), []);
  const handleMouseLeave = React.useCallback(() => setShowTooltip(false), []);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const showError = !!fieldState.error;
        const errorMessage = fieldState.error?.message || "";

        return (
          <FormControl fullWidth error={!!fieldState.error} variant="outlined">
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
              <Select
                {...field}
                size="small"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                error={showError}
                onFocus={(e) => {
                  selectProps.onFocus?.(e);
                  if (showError) setShowTooltip(true);
                }}
                onBlur={(e) => {
                  selectProps.onBlur?.(e);
                  setShowTooltip(false);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                input={
                  <OutlinedInput
                    startAdornment={startAdornment}
                    endAdornment={endAdornment}
                  />
                }
                sx={{
                  "& svg.MuiSelect-icon": {
                    color: !!fieldState.error ? "red" : "inherit",
                  },
                  ...selectSX,
                }}
                {...selectProps}
              >
                {children}
              </Select>
            </Tooltip>
          </FormControl>
        );
      }}
    />
  );
};

export default memo(SelectRFH);
SelectRFH.displayName = "SelectRFH";
