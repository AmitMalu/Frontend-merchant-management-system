import React from "react";
import bharatConnectLogo from "../../assets/bbps-brand/bharat-connect-logo.svg";
import bharatConnectLogoReverse from "../../assets/bbps-brand/bharat-connect-logo-reverse.svg";
import bMnemonicLogo from "../../assets/bbps-brand/b-mnemonic-logo.svg";
import bMnemonicLogoReverse from "../../assets/bbps-brand/b-mnemonic-logo-reverse.svg";
import bAssuredLogo from "../../assets/bbps-brand/b-assured-logo.svg";
import bAssuredLogoReverse from "../../assets/bbps-brand/b-assured-logo-reverse.svg";

/**
 * Official Bharat Connect brand marks (from the NPCI brand guidelines kit).
 * Fixed height per the frontend demo spec's "exactly 35px" note — same
 * markup/size on every screen the mark appears on, never re-sized per screen.
 * Pass `reverse` to use the white variant on a dark background.
 */
const LOGO_HEIGHT = 35;

export const BharatConnectLogo = ({ className = "", reverse = false }) => (
  <img
    src={reverse ? bharatConnectLogoReverse : bharatConnectLogo}
    alt="Bharat Connect"
    className={className}
    style={{ height: LOGO_HEIGHT, width: "auto" }}
  />
);

export const BMnemonicLogo = ({ className = "", reverse = false }) => (
  <img
    src={reverse ? bMnemonicLogoReverse : bMnemonicLogo}
    alt="Bharat Connect"
    className={className}
    style={{ height: LOGO_HEIGHT, width: "auto" }}
  />
);

export const BeAssuredLogo = ({ className = "", reverse = false }) => (
  <img
    src={reverse ? bAssuredLogoReverse : bAssuredLogo}
    alt="B Assured"
    className={className}
    style={{ height: LOGO_HEIGHT, width: "auto" }}
  />
);
