import { themeQuartz, iconSetQuartzLight } from "ag-grid-community";

const agGridTheme = themeQuartz.withPart(iconSetQuartzLight).withParams({
  accentColor: "#003366",
  borderRadius: 2,
  browserColorScheme: "light",
  columnBorder: true,
  rowBorder: true,
  fontFamily: {
    googleFont: "Inter",
  },
  fontSize: 11.5,
  footerRowBorder: true,
  headerBackgroundColor: "#003366",
  headerFontSize: 12,
  headerRowBorder: true,
  headerTextColor: "#FFFFFF",
  headerVerticalPaddingScale: 0.5,
  oddRowBackgroundColor: "#cce6ff",
  pickerButtonBorder: true,
  selectedRowBackgroundColor: "#6abcfbff",
  spacing: 5,
  headerColumnResizeHandleColor: "#87AEBA",
  headerColumnResizeHandleHeight: "40%",
  wrapperBorder: true,
  wrapperBorderRadius: 6,
});

export { agGridTheme };
