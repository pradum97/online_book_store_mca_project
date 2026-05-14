"use client";

import * as React from "react";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { Button, MenuItem, Grid } from "@mui/material";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import { toast } from "react-toastify";
import DatePickerRFH from "@lib/DatePickerRFH";
import TimePickerRFH from "@lib/TimePickerRFH";
import DateTimePickerRFH from "@lib/DateTimePickerRFH";
import AutocompleteRFH from "@lib/AutocompleteRFH";
import ButtonRFH from "@lib/ButtonRFH";

type FormValues = {
  email: string;
  example: string;
};

const generateData = (numItems: number) => {
  return Array.from({ length: numItems }, (_, index) => ({
    value: `Item ${index + 1}`,
    label: `Item ${index + 1}`,
  }));
};

const MyForm: React.FC = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      email: "",
      example: "",
    },
  });

  const { getValues, handleSubmit } = methods;

  const onSubmit = async () => {
    toast.success(
      "You just need to write lorem and the add the amount of words you would like it to add next to it like so:",
    );
    await handleSubmit(
      () => {
        console.log("data-", getValues());
      },
      (param: FieldErrors<FormValues>) => {
        const fieldError = Object.keys(param)[0] as unknown as FormValues;
        const eProperty =
          fieldError as unknown as keyof FieldErrors<FormValues>;
        toast.error(param[eProperty]?.message);
      },
    )();
  };

  const data = generateData(500);

  interface IAtc {
    label: string;
    value: number;
  }

  const options: IAtc[] = Array.from({ length: 20000 }, (_, index) => ({
    label: `Option ${index + 1}`,
    value: index + 1,
  }));

  return (
    <FormProvider {...methods}>
      <Grid container spacing={1}>
        <Grid size={3}>
          <TextFieldRFH
            name="email"
            label="Email"
            type="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            }}
          />
        </Grid>

        <Grid size={3}>
          <TextFieldRFH
            name="password"
            label="Password"
            type="password"
            margin="normal"
            rules={{
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            }}
          />
        </Grid>

        <Grid size={2}>
          <SelectRFH
            name="example"
            label="Select Item"
            rules={{ required: "This field is required" }}
          >
            {data.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </SelectRFH>
        </Grid>

        <Grid size={2}>
          <DatePickerRFH
            name="birthDate"
            label="Birth Date"
            rules={{ required: "Birth date is required" }}
          />
        </Grid>

        <Grid size={3}>
          <TimePickerRFH
            name="time"
            rules={{
              required: "Time is required",
            }}
            label={"Time"}
          />
        </Grid>

        <Grid size={3}>
          <DateTimePickerRFH
            name="dateTime"
            label="Select Date and Time"
            rules={{ required: "Please select a date and time" }}
          />
        </Grid>

        <Grid size={3}>
          <AutocompleteRFH<IAtc>
            name="autocompleteField"
            label="Choose an Option"
            rules={{ required: "This field is required" }}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
              option.value === value?.value
            }
          />
        </Grid>

        <Grid size={6}>
          <ButtonRFH>Login</ButtonRFH>
        </Grid>

        <Grid size={6}>
          <Button
            onClick={onSubmit}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default MyForm;
