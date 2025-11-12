import { API_URL } from '@env';
import i18next from 'i18next';
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
  const { user, refreshToken } = useAuth(); // Get the authenticated user and refreshToken from AuthContext

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

      setLoading(prev => ({ ...prev, [stateKey]: true }));
      setError(prev => ({ ...prev, [stateKey]: null }));
  
      try {
        // First, ensure the token is fresh.
        const currentUser = await refreshToken();
        const token = currentUser?.token?.value;

        if (!token) {
          throw new Error(t('common.unauthorized'));
        }

        const fetchPromises = types.map(async ({ apiType, componentType }) => {
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'lang': i18next.language
          };
          
          const response = await fetch(`${BASE_URL}/api/v1/medical-records?type=${apiType}`, { headers });
          
          
          if (!response.ok) throw new Error(`Failed to fetch type ${apiType}`);
          const json = await response.json();
          console.log(`--- Data fetched for type: ${apiType} ---`, JSON.stringify(json, null, 2));
          
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
        setError(prev => ({ ...prev, [stateKey]: t('common.error_fetching_data', { stateKey: stateKey }) }));
      } finally {
        setLoading(prev => ({ ...prev, [stateKey]: false }));
      }
    }, [user, t, refreshToken, stateSetter, stateKey, types, sort, lastFetched]);
  };
  
  const fetchAllRecords = createFetcher({
    stateKey: 'all',
    stateSetter: setAllRecords,
    types: [
      { apiType: 'lab_test', componentType: 'result' },
      { apiType: 'radiology', componentType: 'eshaa' },
      { apiType: 'diagnosis', componentType: 'report' },
      { apiType: 'prescription', componentType: 'medicine' },
      { apiType: 'consultation', componentType: 'report' },
    ],
    sort: true,
  });
  
  const fetchMedicines = createFetcher({
    stateKey: 'medicines',
    stateSetter: setMedicines,
    types: [{ apiType: 'prescription', componentType: 'medicine' }],
  });
  
  const fetchResults = createFetcher({
    stateKey: 'results',
    stateSetter: setResults,
    types: [{ apiType: 'lab_test', componentType: 'result' }],
  });
  
  const fetchEshaas = createFetcher({
    stateKey: 'eshaa',
    stateSetter: setEshaa,
    types: [{ apiType: 'radiology', componentType: 'eshaa' }],
  });
  
  const fetchReports = createFetcher({
    stateKey: 'reports',
    stateSetter: setReports,
    types: [
      { apiType: 'diagnosis', componentType: 'report' },
      { apiType: 'consultation', componentType: 'report' },
    ],
    sort: true,
  });

  const addMedicine = useCallback(async (newMedicineData) => {
    // 1. Optimistic Update: Add a temporary version to the UI immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMedicine = {
      ...newMedicineData,
      id: tempId,
      icon: Images.medicine,
      pending: true, // Add a flag to indicate it's not saved yet
    };
    setMedicines(prev => [optimisticMedicine, ...prev]);

    try {
      // 2. Ensure token is fresh before making the API call
      const currentUser = await refreshToken();
      const token = currentUser?.token?.value;

      if (!token) {
        throw new Error(t('common.unauthorized'));
      }

      // NOTE: The endpoint and body format are an assumption. Adjust to your actual API.
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'lang': i18next.language
      };

      const response = await fetch(`${BASE_URL}/api/v1/medical-records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...newMedicineData, type: 'prescription' }),
      });

      if (!response.ok) throw new Error('Failed to save medicine to the server.');

      const savedMedicine = await response.json();
      const finalMedicine = mapApiDataToComponentProps(savedMedicine.data, 'medicine');

    } catch (e) {
      console.error("Failed to add medicine:", e);
      // 4. Failure: Rollback the optimistic update by removing the temporary item
      setMedicines(prev => prev.filter(m => m.id !== tempId));
      setError(prev => ({ ...prev, medicines: t('errors.add_medicine_failed') }));
    } // No finally block needed as we handle UI state via rollback
  }, [t, user, refreshToken]);

  const addRecord = useCallback(async (newRecordData) => {
    const formData = new FormData();
    Object.keys(newRecordData).forEach(key => {
      if (key === 'documents' && Array.isArray(newRecordData[key])) {
        newRecordData[key].forEach((doc, index) => {
          // doc should be a file-like object for react-native
          // e.g., { uri: '...', type: 'image/jpeg', name: 'photo.jpg' }
          formData.append(`documents[${index}]`, doc);
        });
      } else {
        formData.append(key, newRecordData[key]);
      }
    });

    try {
      // Ensure token is fresh before making the API call
      const currentUser = await refreshToken();
      const token = currentUser?.token?.value;
      

      if (!token) {
        const unauthorizedError = t('common.unauthorized');
        throw new Error(unauthorizedError);
      }

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'lang': i18next.language
        // 'Content-Type' is not set for FormData, fetch handles it.
      };
      console.log('before request');
      console.log(user);
      
      console.log('--- Logging Request Payload ---', newRecordData);

      const response = await fetch(`${BASE_URL}/api/v1/medical-records`, {
        method: 'POST',
        headers,
        body: formData,
      });
      console.log('after request');

      // Read the response body as text ONCE. This consumes the body stream.
      const responseText = await response.text();
      console.log('--- Server Response ---', responseText);

      let responseData;
      try {
        // Try to parse the text as JSON.
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, responseData will be undefined.
        // We can still use the raw responseText for error messages if needed.
      }

      
      if (!response.ok) {
        // Use the parsed message if available, otherwise use the raw text or a generic error.
        const errorMessage = responseData?.message || (responseData?.errors && Object.values(responseData.errors).flat().join(', ')) || responseText || 'Failed to save record to the server.';
        throw new Error(errorMessage); // Throw the error here to stop execution
      }

      return { success: true, data: responseData };
    } catch (e) {
      console.error("Failed to add record:", e.message);
      const addRecordFailedError = e.message || t('errors.add_record_failed');
      setError(prev => ({ ...prev, all: addRecordFailedError }));
      return { success: false, error: addRecordFailedError };
    }
  }, [t, user, refreshToken]);

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
    addRecord,
  };

  return (
    <MedicalRecordsContext.Provider value={value}>
      {children}
    </MedicalRecordsContext.Provider>
  );
};