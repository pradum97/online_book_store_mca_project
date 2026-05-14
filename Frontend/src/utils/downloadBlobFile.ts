/**
 * Downloads a blob file (Excel, PDF, etc.) in the browser
 * @param blob Blob object from Axios/fetch
 * @param filename Desired name for the downloaded file (with extension)
 */
export const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
