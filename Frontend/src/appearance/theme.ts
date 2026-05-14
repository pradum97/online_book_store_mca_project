import { createTheme, SxProps } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#003366",
    },
    secondary: {
      main: "#FF4081",
    },
  },
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginTop: "0px !important",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "black",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "4px 10px !important",
          fontSize: "14px",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "14px",
          padding: "2.5px 10px !important",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            height: "30px",
          },
          "& .MuiInputBase-input": {
            padding: "2px 10px !important",
          },
        },
      },
    },
  },
});

export default theme;
