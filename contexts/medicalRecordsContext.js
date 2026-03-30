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

const API_TYPE_MAP = {
  'اختبار معملي': 'result',
  'أشعة':         'eshaa',
  'وصفة طبية':   'medicine',
  'تشخيص':       'report',
  'استشارة':      'report',
  'lab_test':     'result',
  'radiology':    'eshaa',
  'prescription': 'medicine',
  'Prescription': 'medicine',
  'diagnosis':    'report',
  'consultation': 'report',
};

const API_TYPE_LABEL_MAP = {
  'تشخيص':       'كشف',
  'استشارة':      'استشارة',
  'وصفة طبية':   'روشتة',
  'diagnosis':    'كشف',
  'Diagnosis':    'كشف',
  'consultation': 'استشارة',
  'prescription': 'روشتة',
  'Prescription': 'روشتة',
  'lab_test':     'اختبار معملي',
  'radiology':    'أشعة',
};

const EMPTY_VALUES = new Set([
  'none', 'null', 'undefined', '', '-', 'n/a',
  'لا يوجد', 'لا يوحد', 'لايوجد', 'لايوحد', 'غير محدد', 'غير متاح', 'لا شيء',
]);

const isEmpty = (val) =>
  val == null || EMPTY_VALUES.has(String(val).trim().toLowerCase());

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
    } catch (_e) {}
  }
  return { description: trimmed };
};

const mapApiDataToComponentProps = (item, componentType, originalTypeSent = null) => {
  let type;
  const rawApiType = item.type || item.record_type || item.recordType;

  if (componentType === 'all') {
    type = API_TYPE_MAP[rawApiType] || 'unknown';
  } else {
    type = componentType;
  }

  let subType;
  if (originalTypeSent && rawApiType === 'Diagnosis') {
    subType = API_TYPE_LABEL_MAP[originalTypeSent] || rawApiType || '';
  } else {
    subType = API_TYPE_LABEL_MAP[rawApiType] || rawApiType || '';
  }

  const commonProps = {
    id:        item.id,
    type,
    subType,
    icon:      item.imageUrl ? { uri: item.imageUrl } : (Images.r5 ?? null),
    date:      item.dates?.created_at?.full,
    documents: item.documents,
  };

  const rawDescription = typeof item.description === 'string' ? item.description : '';

  switch (type) {
    case 'result':
      return { ...commonProps, title: item.title, description: rawDescription, labName: item.provider?.name || '' };
    case 'eshaa':
      return { ...commonProps, title: item.title, description: rawDescription, labName: item.provider?.name || '' };
    case 'report': {
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
    case 'medicine':
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

// ✅ Recursively appends any value (primitive, array, nested object) to FormData
// Produces: lab_tests[0][id]=xxx, lab_tests[1][id]=yyy, documents[0]=file, etc.
const appendToFormData = (formData, key, value) => {
  if (value == null || value === '') return;

  if (value instanceof Object && value.uri) {
    // File/blob object (React Native file picker result)
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      // Signal empty array to server
      formData.append(`${key}[]`, '');
    } else {
      value.forEach((item, index) => {
        appendToFormData(formData, `${key}[${index}]`, item);
      });
    }
    return;
  }

  if (typeof value === 'object') {
    // Nested object: { id: 'xxx' } → key[id]=xxx
    Object.keys(value).forEach(subKey => {
      appendToFormData(formData, `${key}[${subKey}]`, value[subKey]);
    });
    return;
  }

  // Primitive string/number/boolean
  formData.append(key, String(value));
};

export const MedicalRecordsProvider = ({ children }) => {
  const { user, authFetch, fetchCurrentUser } = useAuth();
  const { t } = useTranslation();

  const [allRecords, setAllRecords]     = useState([]);
  const [medicines, setMedicines]       = useState([]);
  const [results, setResults]           = useState([]);
  const [eshaa, setEshaa]               = useState([]);
  const [reports, setReports]           = useState([]);
  const [labTests, setLabTests]         = useState([]);
  const [radiologyExams, setRadiologyExams] = useState([]);

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

  const CACHE_DURATION = 5 * 60 * 1000;

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
        let nationalNumber = user?.user?.resource?.national_number;

        if (!nationalNumber) {
          const currentUser = await fetchCurrentUser();
          if (currentUser?.resource?.national_number) {
            nationalNumber = currentUser.resource.national_number;
          } else {
            throw new Error('National number could not be retrieved');
          }
        }

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

        if (allFailed && types.length > 0) throw new Error(`All fetch attempts failed for ${stateKey}`);

        if (sort) combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));

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
    }, [t, stateKey, types, sort, pagination, loading, user, authFetch, fetchCurrentUser]);
  };

  const fetchAllRecords = createFetcher({ stateKey: 'all',       stateSetter: setAllRecords, types: [{ apiType: null,           componentType: 'all' }],      sort: true });
  const fetchMedicines  = createFetcher({ stateKey: 'medicines', stateSetter: setMedicines,  types: [{ apiType: 'prescription', componentType: 'medicine' }] });
  const fetchResults    = createFetcher({ stateKey: 'results',   stateSetter: setResults,    types: [{ apiType: 'lab_test',     componentType: 'result' }] });
  const fetchEshaas     = createFetcher({ stateKey: 'eshaa',     stateSetter: setEshaa,      types: [{ apiType: 'radiology',    componentType: 'eshaa' }] });
  const fetchReports    = createFetcher({
    stateKey: 'reports', stateSetter: setReports,
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

  const fetchLabTests = useCallback(async () => {
    try {
      const response = await authFetch(`${BASE_URL}/api/v1/lab-tests`);
      if (!response.ok) throw new Error('Failed to fetch lab tests');
      const data = await response.json();
      const formattedTests = data.data?.map(test => ({
        label: test.name || test.title,
        value: test.name || test.title,
        id:    test.id,
      })) || [];
      setLabTests(formattedTests);
      return formattedTests;
    } catch (error) {
      console.error('Failed to fetch lab tests:', error);
      setError(prev => ({ ...prev, labTests: error.message }));
      return [];
    }
  }, [authFetch]);

  const fetchRadiologyExams = useCallback(async () => {
    try {
      const response = await authFetch(`${BASE_URL}/api/v1/radiology-exams`);
      if (!response.ok) throw new Error('Failed to fetch radiology exams');
      const data = await response.json();
      const formattedExams = data.data?.map(exam => ({
        label: exam.name || exam.title,
        value: exam.name || exam.title,
        id:    exam.id,
      })) || [];
      setRadiologyExams(formattedExams);
      return formattedExams;
    } catch (error) {
      console.error('Failed to fetch radiology exams:', error);
      setError(prev => ({ ...prev, radiologyExams: error.message }));
      return [];
    }
  }, [authFetch]);

  const addMedicine = useCallback(async (newMedicineData) => {
    const descriptionParts = [];
    if (newMedicineData.dosage)    descriptionParts.push(newMedicineData.dosage);
    if (newMedicineData.startDate) descriptionParts.push(`من: ${newMedicineData.startDate}`);
    if (newMedicineData.endDate)   descriptionParts.push(`إلى: ${newMedicineData.endDate}`);
    const payload = {
      type:        'Prescription',
      title:       newMedicineData.medicineName,
      description: descriptionParts.join(' | ') || newMedicineData.medicineName,
    };
    return await addRecord(payload);
  }, [t]);

  const addRecord = useCallback(async (newRecordData) => {
    const formData = new FormData();
    const originalType = newRecordData.type;

    // ✅ Use the recursive helper — handles primitives, arrays, and nested objects
    // Produces: lab_tests[0][id]=xxx, radiology_exams[0][id]=yyy, documents[0]=file, etc.
    Object.keys(newRecordData).forEach(key => {
      appendToFormData(formData, key, newRecordData[key]);
    });

    try {
      let nationalNumber = user?.user?.resource?.national_number;

      if (!nationalNumber) {
        const currentUser = await fetchCurrentUser();
        if (currentUser?.resource?.national_number) {
          nationalNumber = currentUser.resource.national_number;
        } else {
          throw new Error('National number could not be retrieved');
        }
      }

      formData.append('user_national_number', nationalNumber);

      const response = await authFetch(`${BASE_URL}/api/v1/medical-records`, {
        method: 'POST',
        body:   formData,
      });

      const responseText = await response.text();
      console.log('--- Server Response ---', responseText);

      let responseData;
      try { responseData = JSON.parse(responseText); } catch (e) {}

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          (responseData?.errors && Object.values(responseData.errors).flat().join(', ')) ||
          responseText ||
          t('errors.add_record_failed');
        throw new Error(errorMessage);
      }

      if (responseData?.data) {
        const newRecord  = mapApiDataToComponentProps(responseData.data, 'all', originalType);
        const mappedType = API_TYPE_MAP[originalType] || newRecord.type;

        fetchAllRecords({ force: true });

        if (originalType === 'prescription' || originalType === 'Prescription') {
          fetchMedicines({ force: true });
        } else if (mappedType === 'result' || originalType === 'lab_test') {
          fetchResults({ force: true });
        } else if (mappedType === 'report' || originalType === 'diagnosis' || originalType === 'consultation') {
          fetchReports({ force: true });
        } else if (mappedType === 'eshaa' || originalType === 'radiology') {
          fetchEshaas({ force: true });
        }
      }

      return { success: true, data: responseData };
    } catch (e) {
      console.error('Failed to add record:', e.message);
      const addRecordFailedError = e.message || t('errors.add_record_failed');
      setError(prev => ({ ...prev, all: addRecordFailedError }));
      return { success: false, error: addRecordFailedError };
    }
  }, [t, user, authFetch, fetchCurrentUser]);

  const value = {
    allRecords, medicines, results, eshaa, reports,
    labTests, radiologyExams,
    loading, error,
    fetchAllRecords, fetchMedicines, fetchResults, fetchEshaas, fetchReports,
    fetchLabTests, fetchRadiologyExams,
    addMedicine, addRecord,
    loadMoreAllRecords, loadMoreMedicines, loadMoreResults, loadMoreEshaas, loadMoreReports,
  };

  return (
    <MedicalRecordsContext.Provider value={value}>
      {children}
    </MedicalRecordsContext.Provider>
  );
};
