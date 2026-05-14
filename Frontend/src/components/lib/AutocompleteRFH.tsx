import React, { JSX } from "react";
import {
  useFormContext,
  Controller,
  RegisterOptions,
  FieldValues,
} from "react-hook-form";
import {
  Autocomplete,
  TextField,
  Tooltip,
  FormControl,
  FormLabel,
  AutocompleteRenderOptionState,
  SxProps,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  AutocompleteOwnerState,
} from "@mui/material";
import { FixedSizeList } from "react-window";
import { libCommonSx } from "@lib/LibCommonStyle";

interface AutocompleteRFHProps<TOptionType> {
  name: string;
  label: string;
  rules?: RegisterOptions<FieldValues, string>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  isVirtualization?: boolean;
  renderInput?: unknown;
  isOptionEqualToValue?:
    | ((option: TOptionType, value: TOptionType) => boolean)
    | undefined;
  options: TOptionType[];
  getOptionLabel(option: TOptionType): string;
  renderOption?:
    | ((
        props: React.HTMLAttributes<HTMLLIElement> & {
          key: unknown;
        },
        option: TOptionType,
        state: AutocompleteRenderOptionState,
      ) => React.ReactNode)
    | undefined;
  renderValue?:
    | ((
        value: NonNullable<TOptionType>,
        getItemProps: (args?: { index?: number }) => {
          className: string;
          disabled: boolean;
          "data-item-index": number;
          tabIndex: -1;
        },
        ownerState: AutocompleteOwnerState<
          TOptionType,
          false,
          false,
          false,
          "div"
        >,
      ) => React.ReactNode)
    | undefined;
  size?: "small" | "medium";
  multiple?: boolean;
  filterSelectedOptions?: boolean;
  limitTags?: number;
  sx?: SxProps;
  clearIcon?: React.ReactNode;
  disabled?: boolean;
  disableClearable?: true | false;
  onChange?:
    | ((
        event: React.SyntheticEvent<Element, Event>,
        value: TOptionType | null,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<TOptionType> | undefined,
      ) => void)
    | undefined;
  placeholder?: string;
}

const LISTBOX_PADDING = 8;

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

const VirtualizedList = React.forwardRef<HTMLDivElement>((props, ref) => {
  const { children, ...other } = props as { children: React.ReactNode[] };
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * 36;
    }
    return itemCount * 36;
  };

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          itemSize={36}
          itemCount={itemCount}
          overscanCount={5}
          outerElementType={OuterElementType}
          itemData={itemData}
          style={{
            padding: "5px",
          }}
        >
          {({ index, style }) => (
            <div
              style={{
                ...style,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                top: `${parseFloat(style.top as string) + LISTBOX_PADDING}px`,
              }}
              title={
                typeof itemData[index] === "string"
                  ? (itemData[index] as string)
                  : undefined
              }
            >
              {itemData[index]}
            </div>
          )}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const AutocompleteRFH = <TOptionType,>({
  name,
  label,
  rules,
  startAdornment,
  endAdornment,
  isVirtualization = true,
  renderInput,
  options,
  getOptionLabel,
  renderOption,
  multiple = false,
  filterSelectedOptions = false,
  size = "small",
  sx,
  limitTags,
  renderValue,
  clearIcon,
  disabled,
  disableClearable = false,
  placeholder,
  ...autocompleteProps
}: AutocompleteRFHProps<TOptionType>) => {
  const { control } = useFormContext();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const showError = Boolean(fieldState.error);
        const errorMessage = fieldState.error?.message || "";

        return (
          <FormControl fullWidth error={showError}>
            <FormLabel htmlFor={name} sx={libCommonSx}>
              {label}
              {rules?.required ? <span style={{ color: "red" }}> *</span> : ""}
            </FormLabel>
            {mounted && (
              <Autocomplete<TOptionType>
                limitTags={limitTags}
                options={options}
                size={size}
                clearIcon={clearIcon}
                value={field.value || (multiple ? [] : null)}
                onChange={(_, value) => field.onChange(value)}
                getOptionLabel={getOptionLabel}
                disableListWrap={isVirtualization}
                slotProps={{
                  listbox: {
                    component: isVirtualization ? VirtualizedList : undefined,
                  },
                }}
                renderValue={renderValue}
                multiple={multiple as false}
                filterSelectedOptions={filterSelectedOptions}
                renderInput={(params) => (
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
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder={placeholder}
                      error={showError}
                      onFocus={() => {
                        if (showError) setShowTooltip(true);
                      }}
                      onBlur={() => {
                        setShowTooltip(false);
                        field.onBlur();
                      }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    />
                  </Tooltip>
                )}
                renderOption={renderOption}
                sx={{
                  height: "27.5px",
                  "& .MuiInputBase-root": {
                    padding: "0.31px !important",
                  },
                  "& .MuiButtonBase-root": {
                    color: !!fieldState.error ? "red" : "inherit",
                  },
                  ...sx,
                }}
                disabled={disabled ?? false}
                disableClearable={disableClearable as false}
                {...autocompleteProps}
              />
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default React.memo(AutocompleteRFH) as <TOptionType>(
  props: AutocompleteRFHProps<TOptionType>,
) => JSX.Element;
VirtualizedList.displayName = "VirtualizedList";
AutocompleteRFH.displayName = "AutocompleteRFH";
OuterElementType.displayName = "OuterElementType";
