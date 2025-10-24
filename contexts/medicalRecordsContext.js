import { API_URL } from '@env';
import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Images from '../constants2/images'; // Assuming this path is correct
import { useAuth } from './authContext';

const MedicalRecordsContext = createContext();

export const useMedicalRecords = () => {
  return useContext(MedicalRecordsContext);
};

const BASE_URL = API_URL; // Use the URL from the .env file

const mapApiDataToComponentProps = (item, type) => {
  let commonProps = {
    id: item.id,
    type: type,
    icon: item.imageUrl ? { uri: item.imageUrl } : Images.n11, // Using n11 as a generic fallback
  };

  switch (type) {
    case 'result': // lab_test (type 1)
      return {
        ...commonProps,
        title: item.name,
        description: item.description,
        date: item.testDate,
        labName: item.labName,
      };
    case 'eshaa': // radiology (type 2)
      return {
        ...commonProps,
        title: item.name,
        description: item.description,
        date: item.scanDate,
        labName: item.clinicName,
      };
    case 'report': // diagnosis (type 3) or consultation (type 5)
      return {
        ...commonProps,
        title: `${item.doctorName}, ${item.diagnosisDate || item.consultationDate}`,
        description: item.details || item.summary,
        date: item.diagnosisDate || item.consultationDate,
      };
    case 'medicine': // prescription (type 4)
      return {
        ...commonProps,
        icon: item.imageUrl ? { uri: item.imageUrl } : Images.medicine,
        title: item.medicineName,
        dose: item.dosage,
        from: item.startDate,
        to: item.endDate,
      };
    default:
      return commonProps;
  }
};

export const MedicalRecordsProvider = ({ children }) => {
  const [allRecords, setAllRecords] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [results, setResults] = useState([]);
  const [eshaa, setEshaa] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState({ all: false, medicines: false, results: false, eshaa: false, reports: false });
  const [lastFetched, setLastFetched] = useState({ all: null, medicines: null, results: null, eshaa: null, reports: null });
  const [error, setError] = useState({ all: null, medicines: null, results: null, eshaa: null, reports: null });

  const { t } = useTranslation();
  const { user } = useAuth(); // Get the authenticated user from AuthContext

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const createFetcher = ({ stateKey, stateSetter, types, sort = false }) => {
    return useCallback(async (options = { force: false }) => {
      const { force } = options;
      const now = Date.now();
      // 1. Check cache. If not forcing a refresh and data is fresh, do nothing.
      if (!force && lastFetched[stateKey] && (now - lastFetched[stateKey] < CACHE_DURATION)) {
        console.log(`Using cached data for ${stateKey}`);
        return;
      }

      if (!user?.data?.token?.value) {
        setError(prev => ({ ...prev, [stateKey]: t('common.unauthorized', { defaultValue: 'Authentication token not found.' }) }));
        return;
      }
  
      setLoading(prev => ({ ...prev, [stateKey]: true }));
      setError(prev => ({ ...prev, [stateKey]: null }));
  
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${user?.data?.token?.value}`,
      };
  
      try {
        const fetchPromises = types.map(async ({ apiType, componentType }) => {
          const response = await fetch(`${BASE_URL}/api/v1/medical-records?type=${apiType}`, { headers });
          
          
          if (!response.ok) throw new Error(`Failed to fetch type ${apiType}`);
          const json = await response.json();
          
          return Array.isArray(json.data)
            ? json.data.map(item => mapApiDataToComponentProps(item, componentType))
            : [];
        });
  
        const results = await Promise.all(fetchPromises);
        let combinedData = results.flat();
  
        if (sort) {
          combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
  
        stateSetter(combinedData);
        // 2. On successful fetch, update the timestamp.
        setLastFetched(prev => ({ ...prev, [stateKey]: Date.now() }));
      } catch (e) {
        
        
        console.error(`Failed to fetch ${stateKey}:`, e);
        setError(prev => ({ ...prev, [stateKey]: t('common.error_fetching_data', { defaultValue: `Failed to load ${stateKey}.` }) }));
      } finally {
        setLoading(prev => ({ ...prev, [stateKey]: false }));
      }
    }, [user, t, stateSetter, stateKey, types, sort, lastFetched]);
  };
  
  const fetchAllRecords = createFetcher({
    stateKey: 'all',
    stateSetter: setAllRecords,
    types: [
      { apiType: 1, componentType: 'result' },
      { apiType: 2, componentType: 'eshaa' },
      { apiType: 3, componentType: 'report' },
      { apiType: 4, componentType: 'medicine' },
      { apiType: 5, componentType: 'report' },
    ],
    sort: true,
  });
  
  const fetchMedicines = createFetcher({
    stateKey: 'medicines',
    stateSetter: setMedicines,
    types: [{ apiType: 4, componentType: 'medicine' }],
  });
  
  const fetchResults = createFetcher({
    stateKey: 'results',
    stateSetter: setResults,
    types: [{ apiType: 1, componentType: 'result' }],
  });
  
  const fetchEshaas = createFetcher({
    stateKey: 'eshaa',
    stateSetter: setEshaa,
    types: [{ apiType: 2, componentType: 'eshaa' }],
  });
  
  const fetchReports = createFetcher({
    stateKey: 'reports',
    stateSetter: setReports,
    types: [
      { apiType: 3, componentType: 'report' },
      { apiType: 5, componentType: 'report' },
    ],
    sort: true,
  });

  const addMedicine = useCallback(async (newMedicineData) => {
    if (!user?.data?.token?.value) {
      setError(prev => ({ ...prev, medicines: t('common.unauthorized', { defaultValue: 'Authentication required to add medicine.' }) }));
      return;
    }

    // 1. Optimistic Update: Add a temporary version to the UI immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMedicine = {
      ...newMedicineData,
      id: tempId,
      icon: Images.medicine,
      pending: true, // Add a flag to indicate it's not saved yet
    };
    setMedicines(prev => [optimisticMedicine, ...prev]);

    // 2. API Call: Try to save the data to the server
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.data.token.value}`,
    };

    try {
      // NOTE: The endpoint and body format are an assumption. Adjust to your actual API.
      const response = await fetch(`${BASE_URL}/api/v1/medical-records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...newMedicineData, type: 4 }), // Assuming type 4 is for medicine
      });

      if (!response.ok) throw new Error('Failed to save medicine to the server.');

      const savedMedicine = await response.json();
      const finalMedicine = mapApiDataToComponentProps(savedMedicine.data, 'medicine');

      // 3. Success: Replace the temporary item with the final one from the server
      setMedicines(prev => prev.map(m => (m.id === tempId ? finalMedicine : m)));
    } catch (e) {
      console.error("Failed to add medicine:", e);
      // 4. Failure: Rollback the optimistic update by removing the temporary item
      setMedicines(prev => prev.filter(m => m.id !== tempId));
      setError(prev => ({ ...prev, medicines: t('errors.add_medicine_failed', { defaultValue: 'Could not save medicine. Please try again.' }) }));
    }
  }, [t, user]);

  const value = {
    allRecords,
    medicines,
    results,
    eshaa,
    reports,
    loading,
    error,
    fetchAllRecords,
    fetchMedicines,
    fetchResults,
    fetchEshaas,
    fetchReports,
    addMedicine,
  };

  return (
    <MedicalRecordsContext.Provider value={value}>
      {children}
    </MedicalRecordsContext.Provider>
  );
};