import React, { useState, useEffect, SetStateAction } from "react";

import { makeFetch } from "../util/util";

const ReportCrimeContext = React.createContext({
  crimeReported: false,
  reportCrime: async (
    data: {
      type: string;
      lat: number;
      lon: number;
      description: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    },
    setServerError: (message: string) => void
  ) => {},
});

export const ReportCrimeProvider = ({ children }: { children: any }) => {
  const [crimeReported, setCrimeReported] = useState(false);

  const reportCrime = async (
    data: {
      type: string;
      lat: number;
      lon: number;
      description: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    },
    setServerError: (message: string) => void
  ) => {
    makeFetch(
      { uri: "/api/v1/crimes", method: "POST", body: data },
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
