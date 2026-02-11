import { createContext, useCallback, useContext, useState } from 'react';
import Constants from 'expo-constants';

import { useTranslation } from 'react-i18next';

import Images from '../constants2/images'; // Assuming this path is correct

import { useAuth } from './authContext';



const MedicalRecordsContext = createContext();



export const useMedicalRecords = () => {

  return useContext(MedicalRecordsContext);

};



// Prefer the same API base resolution strategy as in authContext:
// 1) Use expo extra.API_URL when available
// 2) Fallback to the production backend URL
const BASE_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';



/**

 * Safely parses a JSON string and returns an empty object on failure.

 * @param {string} jsonString The JSON string to parse.

 * @returns {object} The parsed object or an empty object.

 */

const safeJsonParse = (jsonString) => {

  try {

    return jsonString ? JSON.parse(jsonString) : {};

  } catch (e) {

    console.error('Failed to parse description JSON:', e);

    return {};

  }

};



const mapApiDataToComponentProps = (item, componentType) => {

  // When fetching for a summary or 'all' records, we must determine the type from the item's data.

  // Otherwise, we use the componentType passed from the specific fetcher (e.g., 'result' for fetchResults).

  let type;

  if (componentType === 'all') {

    // Use item.type, but fallback to item.record_type to be more robust against API inconsistencies.

    // Make the type detection more robust by checking common key variations.

    const apiType = item.type || item.record_type || item.recordType;

    const typeMapping = {

      // English keys

      'lab_test': 'result',

      'radiology': 'eshaa',

      'diagnosis': 'report',

      'consultation': 'report',

      'prescription': 'medicine',

      // Arabic keys from API

      'اختبار معملي': 'result',

      'وصفة طبية': 'medicine',

      'تشخيص': 'report',

    };

    type = typeMapping[apiType] || 'unknown';

  } else {

    type = componentType;

  }



  let commonProps = {

    id: item.id,

    type: type, // This is now correctly set to 'result', 'eshaa', etc.

    icon: item.imageUrl ? { uri: item.imageUrl } : Images.r5, // Using r5 as a valid generic fallback

    date: item.dates?.created_at?.full, // Use the creation date as a consistent date field

    documents: item.documents,

  };

  

  const parsedDesc = safeJsonParse(item.description);



  switch (type) {

    case 'result': { // lab_test (type 1)

      return {

        ...commonProps,

        title: item.title,

        description: parsedDesc.notes || '', // Show notes as the main description

        labName: parsedDesc.labName || item.provider?.name, // Use parsed labName, fallback to provider

      };

    }

    case 'eshaa': { // radiology (type 2)

      return {

        ...commonProps,

        title: item.title,

        description: parsedDesc.notes || '',

        labName: parsedDesc.labName || item.provider?.name,

      };

    }

    case 'report': { // diagnosis (type 3) or consultation (type 5)

      return {

        ...commonProps,

        title: item.title,

        description: parsedDesc.notes || '',

        doctorName: parsedDesc.doctorName || item.provider?.name,

      };

    }

    case 'medicine': { // prescription (type 4)

      return {

        ...commonProps,

        icon: item.imageUrl ? { uri: item.imageUrl } : Images.medicine,

        title: item.title,

        description: parsedDesc.dosage || '', // Use dosage as the main description

        from: parsedDesc.startDate || item.dates?.start_date?.full,

        to: parsedDesc.endDate || item.dates?.end_date?.full,

      };

    }

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



  // State to manage pagination for each record type

  const [pagination, setPagination] = useState({

    all: { page: 1, hasMore: true },

    medicines: { page: 1, hasMore: true },

    results: { page: 1, hasMore: true },

    eshaa: { page: 1, hasMore: true },

    reports: { page: 1, hasMore: true },

  });

  const [loading, setLoading] = useState({ all: false, medicines: false, results: false, eshaa: false, reports: false });

  const [lastFetched, setLastFetched] = useState({ all: null, medicines: null, results: null, eshaa: null, reports: null });

  const [error, setError] = useState({ all: null, medicines: null, results: null, eshaa: null, reports: null });



  const { t } = useTranslation();

  const { user, authFetch } = useAuth(); // Get the authenticated user and the new authFetch wrapper



  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes



  const createFetcher = ({ stateKey, stateSetter, types, sort = false }) => {

    return useCallback(async (options = { force: false, loadMore: false, per_page: 10 }) => {

      const { force, loadMore, per_page } = options;

      const currentPagination = pagination[stateKey];



      // If we are loading more but there are no more pages, or if we are already loading, exit.

      if ((loadMore && !currentPagination.hasMore) || loading[stateKey]) {

        return;

      }



      const now = Date.now();

      // Check cache. If not forcing a refresh, not loading more, and data is fresh, do nothing.

      if (!force && !loadMore && lastFetched[stateKey] && (now - lastFetched[stateKey] < CACHE_DURATION)) {

        return;

      }



      setLoading(prev => ({ ...prev, [stateKey]: true }));

      setError(prev => ({ ...prev, [stateKey]: null }));

  

      const pageToFetch = loadMore ? currentPagination.page + 1 : 1;



      try {

        // The national_number is still needed for the URL.

        const nationalNumber = user?.user?.resource?.national_number;



        const fetchPromises = types.map(async ({ apiType, componentType }) => {

          // If an apiType is provided, add it to the query to filter results.

          // This is crucial for correct pagination on category-specific tabs.

          const typeQuery = apiType ? `&type=${apiType}` : '';

          const url = `${BASE_URL}/api/v1/medical-records?national_number=${nationalNumber}&page=${pageToFetch}${typeQuery}&per_page=${per_page}`;



          // Use the new authFetch wrapper. No need to manage tokens or headers here!

          const response = await authFetch(url);

        

          



     

          

          if (!response.ok) throw new Error(`Failed to fetch type ${apiType}`);

          const json = await response.json();

          

          

          // Update pagination state based on the response meta-data

          setPagination(prev => ({

            ...prev,

            [stateKey]: {

              page: json.meta.current_page,

              hasMore: !!json.links.next, // `hasMore` is true if a 'next' link exists

            }

          }));



          console.log(`Raw API data for ${stateKey} (page ${pageToFetch}):`, json.data);

          return Array.isArray(json.data) ? json.data.map(item => mapApiDataToComponentProps(item, stateKey === 'all' ? 'all' : componentType)) : [];

        });

  

        const results = await Promise.all(fetchPromises);

        let combinedData = results.flat();

            // console.log("my json "+ combinedData);

        



        // Log the fetched and processed data for debugging

        // console.log(`--- Fetched data for ${stateKey} ---`, combinedData);

  

        if (sort) {

          combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));

        }

  

        if (loadMore) {

          // Append new data to existing data

          stateSetter(prevData => [...prevData, ...combinedData]);

        } else {

          // Replace existing data on a refresh or initial load

          stateSetter(combinedData);

          // On successful fresh fetch, update the timestamp.

          setLastFetched(prev => ({ ...prev, [stateKey]: Date.now() }));

        }

      } catch (e) {

        console.error(`Failed to fetch ${stateKey}:`, e);

        setError(prev => ({ ...prev, [stateKey]: t('common.error_fetching_data', { stateKey: stateKey }) }));

      } finally {

        setLoading(prev => ({ ...prev, [stateKey]: false }));

      }

    }, [t, stateKey, types, sort, pagination, loading, user, authFetch]);

  };

  

  const fetchAllRecords = createFetcher({

    stateKey: 'all',

    stateSetter: setAllRecords,

    // When fetching 'all', we make a single request without a type filter.

    // The mapping logic will handle assigning the correct componentType based on the API response.

    types: [

      // The componentType here is a fallback; the real mapping happens in mapApiDataToComponentProps

      // based on the 'type' field from the API data for each item.

      { apiType: null, componentType: 'all' } 

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

    stateSetter: setReports, // Directly set the reports state

    types: [

      // Fetch both diagnosis and consultation records for the 'Reports' screen

      { apiType: 'diagnosis', componentType: 'report' },

      { apiType: 'consultation', componentType: 'report' },

    ],

    sort: true, // Sort all reports by date

  });



  // Functions to load the next page of data for each type

  const loadMoreAllRecords = () => fetchAllRecords({ loadMore: true });

  const loadMoreMedicines = () => fetchMedicines({ loadMore: true });

  const loadMoreResults = () => fetchResults({ loadMore: true });

  const loadMoreEshaas = () => fetchEshaas({ loadMore: true });

  // Re-enable load more for reports

  const loadMoreReports = () => fetchReports({ loadMore: true });



  const addMedicine = useCallback(async (newMedicineData) => {

    // This function now acts as a wrapper around the generic addRecord.

    // It prepares the payload specifically for a medicine record.

    const descriptionObject = {

      dosage: newMedicineData.dosage,

      startDate: newMedicineData.startDate,

      endDate: newMedicineData.endDate,

    };



    const payload = {

      type: 'prescription',

      title: newMedicineData.medicineName,

      description: JSON.stringify(descriptionObject),

    };



    return await addRecord(payload);

  }, [t]); // Removed addRecord from dependency array



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

      const nationalNumber = user?.user?.resource?.national_number;



      // Append the national number to the form data

      formData.append('user_national_number', nationalNumber);



      // Use authFetch for the POST request.

      // The updated authFetch will automatically handle the Content-Type for FormData.

      const response = await authFetch(`${BASE_URL}/api/v1/medical-records`, {

        method: 'POST',

        body: formData,

      });



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

        const errorMessage = responseData?.message || (responseData?.errors && Object.values(responseData.errors).flat().join(', ')) || responseText || t('errors.add_record_failed');

        throw new Error(errorMessage); // Throw the error here to stop execution

      }



      // After a successful save, update the 'allRecords' state

      // to include the new record without needing a full refresh.

      if (responseData?.data) {

        const newRecord = mapApiDataToComponentProps(responseData.data, 'all');

        // Instead of updating each state manually, we can just force a refresh

        // of the relevant lists. This is simpler and ensures data consistency.

        fetchAllRecords({ force: true });

        

        // Selectively refresh based on type

        if (newRecord.type === 'medicine') fetchMedicines({ force: true });

        if (newRecord.type === 'result') fetchResults({ force: true });

        if (newRecord.type === 'report') fetchReports({ force: true });

        if (newRecord.type === 'eshaa') fetchEshaas({ force: true });

      }



      return { success: true, data: responseData };

    } catch (e) {

      console.error("Failed to add record:", e.message);

      const addRecordFailedError = e.message || t('errors.add_record_failed');

      setError(prev => ({ ...prev, all: addRecordFailedError }));

      return { success: false, error: addRecordFailedError };

    }

  }, [t, user, authFetch]);



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

    loadMoreAllRecords,

    loadMoreMedicines,

    loadMoreResults,

    loadMoreEshaas,

    loadMoreReports,

  };



  return (

    <MedicalRecordsContext.Provider value={value}>

      {children}

    </MedicalRecordsContext.Provider>

  );

};