import * as React from "react";
import { Font } from "@react-email/components";

export const BarebonesFonts = () => (
  <Font
    fontFamily="Inter"
    fallbackFontFamily="Arial"
    webFont={{
      url: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp5GPtb1T0VS.woff2",
      format: "woff2",
    }}
    fontWeight={400}
    fontStyle="normal"
  />
);
