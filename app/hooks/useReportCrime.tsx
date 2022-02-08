import React, { useState, useEffect, SetStateAction } from "react";

import {
  validateReportCrime,
} from "../util/util";



const ReportCrimeContext = React.createContext({
  crimeReported: false,
  reportCrime: async (
    data: {
        crime_type: string;
        lat: number;
        long: number;
        description: string;
        city: string;
        state: string;
        country: string;
        road: string;
        pincode: string;
      },
    setServerError: (message: string) => void
  ) => {},
});

export const ReportCrimeProvider = ({ children }: { children: any }) => {
  const [crimeReported, setCrimeReported] = useState(false);

  const reportCrime = async (
    data: {
        crime_type: string;
        lat: number;
        long: number;
        description: string;
        city: string;
        state: string;
        country: string;
        road: string;
        pincode: string;
      },
    setServerError: (message: string) => void
  ) => {
    console.log(data);
    validateReportCrime(
      data,
      () => setCrimeReported(true),
      (message: string) => setServerError(message)
    );
  };

  return (
    <ReportCrimeContext.Provider
      value={{
        crimeReported,
        reportCrime,
      }}
    >
      {children}
    </ReportCrimeContext.Provider>
  );
};

export const useReportCrime = () => React.useContext(ReportCrimeContext);
