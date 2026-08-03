/** Canonical brand assets for the whole mobile app. */

export const BRAND_NAME = "OboxSTEAM";

/** Remote source of truth — prefer bundled `BRAND_LOGO` for offline cold starts. */
export const BRAND_LOGO_URL =
  "https://oboxsteam-bucket-main.s3.ap-southeast-1.amazonaws.com/Seed/Material/logo-obox.png";

/** Bundled logo for intro / welcome (network-independent). */
export const BRAND_LOGO = require("../../assets/images/logo-obox.png");
