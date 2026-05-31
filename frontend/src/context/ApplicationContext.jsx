import { createContext, useContext, useState, useEffect } from 'react';

const ApplicationContext = createContext(null);

export function ApplicationProvider({ children }) {
  const [applicationId, setApplicationId] = useState(() => localStorage.getItem("applicationId"));
  const [countryCode, setCountryCode] = useState(() => localStorage.getItem("countryCode") || "");
  const [visaTypeId, setVisaTypeId] = useState(() => localStorage.getItem("visaTypeId") || "");
  const [applicantNationality, setApplicantNationality] = useState(() => localStorage.getItem("applicantNationality") || "IND");
  const [requirements, setRequirements] = useState(() => {
    try {
      const stored = localStorage.getItem("requirements");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (applicationId) {
      localStorage.setItem("applicationId", applicationId);
    } else {
      localStorage.removeItem("applicationId");
    }
  }, [applicationId]);

  useEffect(() => {
    if (countryCode) {
      localStorage.setItem("countryCode", countryCode);
    } else {
      localStorage.removeItem("countryCode");
    }
  }, [countryCode]);

  useEffect(() => {
    if (visaTypeId) {
      localStorage.setItem("visaTypeId", visaTypeId);
    } else {
      localStorage.removeItem("visaTypeId");
    }
  }, [visaTypeId]);

  useEffect(() => {
    if (applicantNationality) {
      localStorage.setItem("applicantNationality", applicantNationality);
    } else {
      localStorage.removeItem("applicantNationality");
    }
  }, [applicantNationality]);

  useEffect(() => {
    localStorage.setItem("requirements", JSON.stringify(requirements));
  }, [requirements]);

  const resetApplication = () => {
    setApplicationId(null);
    setCountryCode("");
    setVisaTypeId("");
    setApplicantNationality("IND");
    setRequirements([]);
    localStorage.removeItem("applicationId");
    localStorage.removeItem("countryCode");
    localStorage.removeItem("visaTypeId");
    localStorage.removeItem("applicantNationality");
    localStorage.removeItem("requirements");
  };

  return (
    <ApplicationContext.Provider value={{
      applicationId,
      setApplicationId,
      countryCode,
      setCountryCode,
      visaTypeId,
      setVisaTypeId,
      applicantNationality,
      setApplicantNationality,
      requirements,
      setRequirements,
      resetApplication
    }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}
