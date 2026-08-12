import {
  MdPhoneAndroid,
  MdPhone,
  MdRouter,
  MdTv,
  MdConnectedTv,
  MdBolt,
  MdWaterDrop,
  MdLocalFireDepartment,
  MdPropaneTank,
  MdDirectionsCar,
  MdSecurity,
  MdLocalHospital,
  MdBiotech,
  MdSchool,
  MdVolunteerActivism,
  MdApartment,
  MdLocationCity,
  MdAccountBalance,
  MdSavings,
  MdHomeWork,
  MdSubscriptions,
  MdCreditCard,
  MdGroups,
  MdPayments,
  MdReceiptLong,
  MdElectricCar,
  MdAccountBalanceWallet,
  MdLocalShipping,
  MdMoney,
} from "react-icons/md";

export const bbpsIconMap = {
  // Mobile
  mobile_prepaid:       MdPhoneAndroid,
  mobile_postpaid:      MdPhoneAndroid,
  landline_postpaid:    MdPhone,
  // Internet / TV
  broadband_postpaid:   MdRouter,
  cable_tv:             MdConnectedTv,
  dth:                  MdTv,
  // Utilities
  electricity:          MdBolt,
  water:                MdWaterDrop,
  gas:                  MdLocalFireDepartment,
  lpg_gas:              MdPropaneTank,
  // Banking
  loan_repayment:       MdAccountBalance,
  recurring_deposit:    MdSavings,
  insurance:            MdSecurity,
  credit_card:          MdCreditCard,
  fastag:               MdDirectionsCar,
  fleet_card_recharge:  MdLocalShipping,
  ncmc_recharge:        MdCreditCard,
  national_pension_system: MdAccountBalanceWallet,
  // Home
  housing_society:      MdApartment,
  municipal_services:   MdLocationCity,
  municipal_taxes:      MdLocationCity,
  rental:               MdHomeWork,
  // Education
  education_fees:       MdSchool,
  // Healthcare
  hospital:             MdLocalHospital,
  hospital_and_pathology: MdBiotech,
  // Others
  donation:             MdVolunteerActivism,
  clubs_and_associations: MdGroups,
  subscription:         MdSubscriptions,
  subscription_fees:    MdSubscriptions,
  // Additional
  echallan:             MdReceiptLong,
  prepaid_meter:        MdBolt,
  agent_collection:     MdMoney,
  ev_recharge:          MdElectricCar,
};

export const getBbpsIcon = (serviceName) => {
  const key = serviceName
    ?.trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "_");
  return bbpsIconMap[key] || MdPayments;
};
