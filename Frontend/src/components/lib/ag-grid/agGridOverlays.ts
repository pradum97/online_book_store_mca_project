export const getAgGridOverlays = (entityName: string) => ({
  overlayLoadingTemplate: `<span style="padding:10px;display:block;font-size:15px;">Loading ${entityName}...</span>`,
  overlayNoRowsTemplate: `<span style="padding:10px;display:block;font-size:18px;">No ${entityName} found</span>`,
});
