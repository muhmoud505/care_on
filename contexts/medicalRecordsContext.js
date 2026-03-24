import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useState } from 'react';

import { useTranslation } from 'react-i18next';

import Images from '../constants2/images';

import { useAuth } from './authContext';



const MedicalRecordsContext = createContext();



export const useMedicalRecords = () => {
  return useContext(MedicalRecordsContext);
};



const BASE_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';



/**
 * The API always returns Arabic type strings in item.type.
 * English keys are kept as a safety net in case the API ever changes.
 * Maps API type → internal component type used for rendering decisions.
 */
const API_TYPE_MAP = {
  // Arabic — what the real API returns
  'اختبار معملي': 'result',
  'أشعة':         'eshaa',
  'وصفة طبية':   'medicine',
  'تشخيص':       'report',
  'استشارة':      'report',
  // English — safety net
  'lab_test':     'result',
  'radiology':    'eshaa',
  'prescription': 'medicine',
  'diagnosis':    'report',
  'consultation': 'report',
};

/**
 * Maps API type → Arabic display label shown in the UI.
 * Used to populate the `subType` field so components can display
 * "كشف" or "روشتة" instead of the internal "report" string.
 */
const API_TYPE_LABEL_MAP = {
  // Arabic API values
  'تشخيص':       'كشف',
  'استشارة':      'كشف',
  'وصفة طبية':   'روشتة',
  // English API values
  'diagnosis':    'كشف',
  'consultation': 'كشف',
  'prescription': 'روشتة',
  'lab_test':     'اختبار معملي',
  'radiology':    'أشعة',
};

/**
 * Values that mean "nothing entered" — used to clean up description JSON fields.
 * Covers common English and Arabic placeholder strings users type when a field
 * is not applicable.
 */
const EMPTY_VALUES = new Set([
  'none', 'null', 'undefined', '', '-', 'n/a',
  // Arabic equivalents
  'لا يوجد', 'لا يوحد', 'لايوجد', 'لايوحد', 'غير محدد', 'غير متاح', 'لا شيء',
]);

const isEmpty = (val) =>
  val == null || EMPTY_VALUES.has(String(val).trim().toLowerCase());

/**
 * Parses the description string into a clean structured object for report cards.
 * Handles both JSON (new records) and plain text (legacy records).
 * Filters out Arabic/English "empty" placeholder values so blank rows are hidden.
 */
const parseDescriptionToProps = (description) => {
  if (!description || typeof description !== 'string') return { description: '' };

  const trimmed = description.trim();

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        description:   trimmed,
        parsedDate:    !isEmpty(parsed.date)                                  ? parsed.date                                    : '',
        requiredTests: !isEmpty(parsed.RequiredTests ?? parsed.requiredTests) ? (parsed.RequiredTests ?? parsed.requiredTests) : '',
        requiredScans: !isEmpty(parsed.RequiredScans ?? parsed.requiredScans) ? (parsed.RequiredScans ?? parsed.requiredScans) : '',
        diagnosis:     !isEmpty(parsed.diagnosis)                             ? parsed.diagnosis                               : '',
        notes:         !isEmpty(parsed.notes)                                 ? parsed.notes                                   : '',
      };
    } catch (_e) {
      // Not valid JSON — fall through and treat whole string as plain-text notes
    }
  }

  // Legacy plain-text description
  return { description: trimmed };
};


const mapApiDataToComponentProps = (item, componentType) => {
  let type;
  // Raw API type string (Arabic or English)
  const rawApiType = item.type || item.record_type || item.recordType;

  if (componentType === 'all') {
    type = API_TYPE_MAP[rawApiType] || 'unknown';
  } else {
    type = componentType;
  }

  // Arabic display label — e.g. "كشف", "روشتة", "اختبار معملي"
  const subType = API_TYPE_LABEL_MAP[rawApiType] || rawApiType || '';

  const commonProps = {
    id:        item.id,
    type,
    subType,
    icon:      item.imageUrl ? { uri: item.imageUrl } : (Images.r5 ?? null),
    date:      item.dates?.created_at?.full,
    documents: item.documents,
  };

  // Raw description string from the API
  const rawDescription = typeof item.description === 'string' ? item.description : '';

  switch (type) {
    case 'result': // اختبار معملي
      return {
        ...commonProps,
        title:       item.title,
        description: rawDescription,
        labName:     item.provider?.name || '',
      };

    case 'eshaa': // أشعة
      return {
        ...commonProps,
        title:       item.title,
        description: rawDescription,
        labName:     item.provider?.name || '',
      };

    case 'report': { // تشخيص / استشارة
      // Pre-parse the JSON description so Report.js receives clean individual props
      const descProps = parseDescriptionToProps(rawDescription);
      return {
        ...commonProps,
        title:         item.title,
        doctorName:    item.provider?.name || item.title || '',
        date:          item.dates?.created_at?.full || descProps.parsedDate || '',
        description:   descProps.description   || '',
        requiredTests: descProps.requiredTests  || '',
        requiredScans: descProps.requiredScans  || '',
        diagnosis:     descProps.diagnosis      || '',
        notes:         descProps.notes          || '',
      };
    }

    case 'medicine': // وصفة طبية
      return {
        ...commonProps,
        icon:        item.imageUrl ? { uri: item.imageUrl } : (Images.medicine ?? null),
        title:       item.title,
        description: rawDescription,
        from:        item.dates?.start_date?.full || '',
        to:          item.dates?.end_date?.full   || '',
      };

    default:
      return { ...commonProps, title: item.title, description: rawDescription };
  }
};



export const MedicalRecordsProvider = ({ children }) => {
  const [allRecords, setAllRecords] = useState([]);
  const [medicines,  setMedicines]  = useState([]);
  const [results,    setResults]    = useState([]);
  const [eshaa,      setEshaa]      = useState([]);
  const [reports,    setReports]    = useState([]);

  const [pagination, setPagination] = useState({
    all:       { page: 1, hasMore: true },
    medicines: { page: 1, hasMore: true },
    results:   { page: 1, hasMore: true },
    eshaa:     { page: 1, hasMore: true },
    reports:   { page: 1, hasMore: true },
  });
  const [loading, setLoading] = useState({
    all: false, medicines: false, results: false, eshaa: false, reports: false,
  });
  const [lastFetched, setLastFetched] = useState({
    all: null, medicines: null, results: null, eshaa: null, reports: null,
  });
  const [error, setError] = useState({
    all: null, medicines: null, results: null, eshaa: null, reports: null,
  });

  const { t }               = useTranslation();
  const { user, authFetch } = useAuth();

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const createFetcher = ({ stateKey, stateSetter, types, sort = false }) => {
    return useCallback(async (options = { force: false, loadMore: false, per_page: 10 }) => {
      const { force, loadMore, per_page } = options;
      const currentPagination = pagination[stateKey];

      if ((loadMore && !currentPagination.hasMore) || loading[stateKey]) return;

      const now = Date.now();
      if (!force && !loadMore && lastFetched[stateKey] && (now - lastFetched[stateKey] < CACHE_DURATION)) return;

      setLoading(prev => ({ ...prev, [stateKey]: true }));
      setError(prev =>   ({ ...prev, [stateKey]: null }));

      const pageToFetch = loadMore ? currentPagination.page + 1 : 1;

      try {
        const nationalNumber = user?.user?.resource?.national_number;

        const settledResults = await Promise.allSettled(
          types.map(async ({ apiType, componentType }) => {
            const typeQuery = apiType ? `&type=${apiType}` : '';
            const url = `${BASE_URL}/api/v1/medical-records?national_number=${nationalNumber}&page=${pageToFetch}${typeQuery}&per_page=${per_page}`;

            const response = await authFetch(url);
            if (!response.ok) throw new Error(`Failed to fetch type ${apiType}`);

            const json = await response.json();

            setPagination(prev => ({
              ...prev,
              [stateKey]: {
                page:    json.meta.current_page,
                hasMore: !!json.links.next,
              },
            }));

            return Array.isArray(json.data)
              ? json.data.map(item =>
                  mapApiDataToComponentProps(item, stateKey === 'all' ? 'all' : componentType)
                )
              : [];
          })
        );

        let combinedData = [];
        let allFailed = true;

        settledResults.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            combinedData = combinedData.concat(result.value);
            allFailed = false;
          } else {
            console.error(`Failed to fetch ${stateKey} type [${types[i]?.apiType}]:`, result.reason?.message);
          }
        });

        if (allFailed && types.length > 0) {
          throw new Error(`All fetch attempts failed for ${stateKey}`);
        }

        if (sort) {
          combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        if (loadMore) {
          stateSetter(prev => [...prev, ...combinedData]);
        } else {
          stateSetter(combinedData);
          setLastFetched(prev => ({ ...prev, [stateKey]: Date.now() }));
        }
      } catch (e) {
        console.error(`Failed to fetch ${stateKey}:`, e);
        setError(prev => ({ ...prev, [stateKey]: t('common.error_fetching_data', { stateKey }) }));
      } finally {
        setLoading(prev => ({ ...prev, [stateKey]: false }));
      }
    }, [t, stateKey, types, sort, pagination, loading, user, authFetch]);
  };

  const fetchAllRecords = createFetcher({
    stateKey:    'all',
    stateSetter: setAllRecords,
    types:       [{ apiType: null, componentType: 'all' }],
    sort:        true,
  });

  const fetchMedicines = createFetcher({
    stateKey:    'medicines',
    stateSetter: setMedicines,
    types:       [{ apiType: 'prescription', componentType: 'medicine' }],
  });

  const fetchResults = createFetcher({
    stateKey:    'results',
    stateSetter: setResults,
    types:       [{ apiType: 'lab_test', componentType: 'result' }],
  });

  const fetchEshaas = createFetcher({
    stateKey:    'eshaa',
    stateSetter: setEshaa,
    types:       [{ apiType: 'radiology', componentType: 'eshaa' }],
  });

  const fetchReports = createFetcher({
    stateKey:    'reports',
    stateSetter: setReports,
    types: [
      { apiType: 'diagnosis',    componentType: 'report' },
      { apiType: 'consultation', componentType: 'report' },
    ],
    sort: true,
  });

  const loadMoreAllRecords = () => fetchAllRecords({ loadMore: true });
  const loadMoreMedicines  = () => fetchMedicines({ loadMore: true });
  const loadMoreResults    = () => fetchResults({ loadMore: true });
  const loadMoreEshaas     = () => fetchEshaas({ loadMore: true });
  const loadMoreReports    = () => fetchReports({ loadMore: true });

  const addMedicine = useCallback(async (newMedicineData) => {
    const descriptionParts = [];
    if (newMedicineData.dosage)     descriptionParts.push(newMedicineData.dosage);
    if (newMedicineData.startDate)  descriptionParts.push(`من: ${newMedicineData.startDate}`);
    if (newMedicineData.endDate)    descriptionParts.push(`إلى: ${newMedicineData.endDate}`);

    const payload = {
      type:        'prescription',
      title:       newMedicineData.medicineName,
      description: descriptionParts.join(' | ') || newMedicineData.medicineName,
    };

    return await addRecord(payload);
  }, [t]);

  const addRecord = useCallback(async (newRecordData) => {
    const formData = new FormData();

    Object.keys(newRecordData).forEach(key => {
      if (key === 'documents' && Array.isArray(newRecordData[key])) {
        newRecordData[key].forEach((doc, index) => {
          formData.append(`documents[${index}]`, doc);
        });
      } else if (newRecordData[key] != null && newRecordData[key] !== '') {
        formData.append(key, newRecordData[key]);
      }
    });

    try {
      console.log(user);
      
      const nationalNumber = user?.user?.resource?.national_number;

      console.log(nationalNumber);
      
      formData.append('user_national_number', nationalNumber);

      const response = await authFetch(`${BASE_URL}/api/v1/medical-records`, {
        method: 'POST',
        body:   formData,
      });

      const responseText = await response.text();
      console.log('--- Server Response ---', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // non-JSON response — responseData stays undefined
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          (responseData?.errors && Object.values(responseData.errors).flat().join(', ')) ||
          responseText ||
          t('errors.add_record_failed');
        throw new Error(errorMessage);
      }

      if (responseData?.data) {
        const newRecord = mapApiDataToComponentProps(responseData.data, 'all');

        fetchAllRecords({ force: true });
        if (newRecord.type === 'medicine') fetchMedicines({ force: true });
        if (newRecord.type === 'result')   fetchResults({ force: true });
        if (newRecord.type === 'report')   fetchReports({ force: true });
        if (newRecord.type === 'eshaa')    fetchEshaas({ force: true });
      }

      return { success: true, data: responseData };
    } catch (e) {
      console.error('Failed to add record:', e.message);
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
