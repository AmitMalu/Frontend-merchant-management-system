import React from "react";
import bharatConnectLogo from "../../assets/bbps-brand/bharat-connect-logo.svg";
import bharatConnectLogoReverse from "../../assets/bbps-brand/bharat-connect-logo-reverse.svg";
import bMnemonicLogo from "../../assets/bbps-brand/b-mnemonic-logo.svg";
import bMnemonicLogoReverse from "../../assets/bbps-brand/b-mnemonic-logo-reverse.svg";
import bAssuredLogo from "../../assets/bbps-brand/b-assured-logo.svg";
import bAssuredLogoReverse from "../../assets/bbps-brand/b-assured-logo-reverse.svg";

/**
 * Official Bharat Connect brand marks (from the NPCI brand guidelines kit).
 * Each mark has its own fixed, reviewer-specified box size — same size on
 * every screen it appears on, never re-sized per screen:
 *   - Bharat Connect (horizontal) logo: 83 x 30 px
 *   - B Assured logo: 130 x 120 px
 *   - B mnemonic: no reviewer-specified box yet, kept at the original 35px
 *     height / auto width used elsewhere.
 * The box is a bounding box, not a forced stretch — object-fit: contain
 * scales the artwork proportionally within it instead of distorting it,
 * since none of these marks' native SVG proportions exactly match the
 * specified box ratio.
 * Pass `reverse` to use the white variant on a dark background.
 */
export const BharatConnectLogo = ({ className = "", reverse = false }) => (
  <img
    src={reverse ? bharatConnectLogoReverse : bharatConnectLogo}
    alt="Bharat Connect"
    className={className}
    style={{ width: 83, height: 30, objectFit: "contain" }}
  />
);

export const BMnemonicLogo = ({ className = "", reverse = false }) => (
  <img
    src={reverse ? bMnemonicLogoReverse : bMnemonicLogo}
    alt="Bharat Connect"
    className={className}
    style={{ height: 35, width: "auto" }}
  />
);

export const BeAssuredLogo = ({ className = "", reverse = false }) => (
  <img
    src={reverse ? bAssuredLogoReverse : bAssuredLogo}
    alt="B Assured"
    className={className}
    style={{ width: 130, height: 120, objectFit: "contain" }}
  />
);
