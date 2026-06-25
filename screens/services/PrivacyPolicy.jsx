import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import useRTL from '../../hooks/useRTL';
import { hp, wp } from '../../utils/responsive';

const PrivacyPolicy = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useRTL();
  const { width } = useWindowDimensions();

  const [privacyData, setPrivacyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Static fallback content for privacy policy
  // const staticPrivacyContent = {
  //   ar: {
  //     title: 'سياسة الخصوصية',
  //     content: `
  //       <h2>سياسة الخصوصية لتطبيق وموقع رعاية 360</h2>
  //       <p>تاريخ آخر تحديث: 2026/6/15</p>
  //       <p>نحن في رعاية 360 ندرك تماماً حساسية وأهمية البيانات الطبية الخاصة بك. تهدف سياسة الخصوصية هذه إلى توضيح كيفية جمعنا لبياناتك، استخدامها، وحمايتها بأعلى معايير الأمان والسرية.</p>
        
  //       <h2>1- البيانات التي نقوم بجمعها</h2>
  //       <p>نقوم بجمع نوعين رئيسيين من البيانات:</p>
  //       <ul>
  //         <li>بيانات الحساب الأساسية: مثل الاسم، العمر، معلومات الاتصال، وبيانات تسجيل الدخول</li>
  //         <li>السجل الطبي للمريض: يشمل بيانات الكشف، التشخيصات، الوصفات الطبية، ونتائج الأشعة والتحاليل</li>
  //       </ul>
        
  //       <h2>2- الخصوصية والبيانات الصحية الحساسة</h2>
  //       <p>نحن نلتزم بحماية بياناتك الصحية وفقًا لأعلى معايير الأمان:</p>
  //       <ul>
  //         <li><strong>التشفير:</strong> جميع البيانات الطبية تُخزن بشكل مشفرة سواء أثناء النقل أو التخزين على الخوادم</li>
  //         <li><strong>السرية:</strong> لن يتم مشاركة تاريخك الطبي مع أي طرف ثالث إلا بموافقتك الخطية المسبقة والصريحة</li>
  //         <li><strong>الوصول:</strong> أنت وحدك (ومن تمنحهم صلاحية الوصول عبر كلمة المرور) من يمكنه رؤية بياناتك</li>
  //         <li><strong>نسخ احتياطي:</strong> قد نأخذ نسخًا احتياطية مشفرة للبيانات لضمان عدم فقدانها</li>
  //       </ul>
        
  //       <h2>3- استخدام البيانات لأغراض الإحصاء والبحث العلمي</h2>
  //       <p>يحق لـ رعاية 360 معالجة البيانات الطبية المتوفرة لاستخراج إحصائيات عامة ومؤشرات صحية. يتم تجريد هذه البيانات الإحصائية بالكامل من أي معلومات قد تؤدي إلى التعرف على هوية المريض قبل استخدامها.</p>
        
  //       <h2>4- إخلاء مسؤولية طبية</h2>
  //       <p>التطبيق ليس أداة تشخيص: التطبيق لا يُشخص الأمراض، ولا يصف علاجات، ولا يقدم توصيات طبية. جميع البيانات المعروضة هي كما أدخلها المستخدم.</p>
        
  //       <h2>5- التواصل والدعم</h2>
  //       <p>في حال وجود أي استفسارات أو شكاوى، يمكن التواصل معنا عبر البريد الإلكتروني: re3aya360@gmail.com</p>
  //     `,
  //     updated_at: '2026-06-15'
  //   },
  //   en: {
  //     title: 'Privacy Policy',
  //     content: `
  //       <h2>Privacy Policy for Rayaa 360 Application and Website</h2>
  //       <p>Last updated: June 15, 2026</p>
  //       <p>At Rayaa 360, we fully recognize the sensitivity and importance of your medical data. This privacy policy aims to clarify how we collect, use, and protect your data with the highest security and confidentiality standards.</p>
        
  //       <h2>1- Data We Collect</h2>
  //       <p>We collect two main types of data:</p>
  //       <ul>
  //         <li>Basic Account Data: such as name, age, contact information, and login data</li>
  //         <li>Patient Medical Record: Includes examination data, diagnoses, prescriptions, and radiology and lab results</li>
  //       </ul>
        
  //       <h2>2- Privacy and Sensitive Health Data</h2>
  //       <p>We are committed to protecting your health data according to the highest security standards:</p>
  //       <ul>
  //         <li><strong>Encryption:</strong> All medical data is stored encrypted whether during transmission or storage on servers</li>
  //         <li><strong>Confidentiality:</strong> Your medical history will not be shared with any third party except with your prior and explicit written consent</li>
  //         <li><strong>Access:</strong> You alone (and those you grant access via password) can view your data</li>
  //         <li><strong>Backup:</strong> We may take encrypted backup copies of the data to ensure it is not lost</li>
  //       </ul>
        
  //       <h2>3- Use of Data for Statistical and Scientific Research Purposes</h2>
  //       <p>Rayaa 360 has the right to process available medical data to extract general statistics and health indicators. These statistical data are completely stripped of any information that could lead to identifying the patient before use.</p>
        
  //       <h2>4- Medical Disclaimer</h2>
  //       <p>The application is not a diagnostic tool: The application does not diagnose diseases, does not prescribe treatments, and does not provide medical recommendations. All data displayed is as entered by the user.</p>
        
  //       <h2>5- Communication and Support</h2>
  //       <p>In case of any inquiries or complaints, you can contact us via email: re3aya360@gmail.com</p>
  //     `,
  //     updated_at: '2026-06-15'
  //   }
  // };

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);

      const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';
      const response = await fetch(`${API_URL}/api/v1/legal-pages/privacy-policy`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'accept-language': i18n.language,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch privacy policy');

      const json = await response.json();

      // Extract the nested `data` object from the API response
      if (json.success && json.data) {
        console.log(json.data);
        
        setPrivacyData(json.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      // Use static content as fallback instead of showing error
      const currentLang = i18n.language || 'ar';
      setPrivacyData(staticPrivacyContent[currentLang] || staticPrivacyContent.ar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacyPolicy();
  }, [i18n.language]); // Re-fetch when language changes

  // Custom styles for the rendered HTML
  const tagsStyles = {
  h2: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginTop: hp(2.5),
    marginBottom: hp(1),
    textAlign: isRTL ? 'left' : 'right',  // ✅ Fixed: RTL = right
    borderBottomWidth: 1,
    borderBottomColor: '#E0EAFF',
    paddingBottom: hp(0.8),
  },
  p: {
    fontSize: Math.min(wp(3.8), 15),
    color: '#444',
    lineHeight: hp(3),
    textAlign: isRTL ? 'left' : 'right',  // ✅ Fixed
    marginBottom: hp(1),
  },
  ul: {
    marginBottom: hp(1.5),
    paddingLeft: isRTL ? 0 : wp(4),
    paddingRight: isRTL ? wp(4) : 0,
  },
  li: {
    fontSize: Math.min(wp(3.8), 15),
    color: '#444',
    lineHeight: hp(3),
    textAlign: isRTL ? 'left' : 'right',  // ✅ Fixed
    marginBottom: hp(0.5),
  },
  strong: {
    fontWeight: '700',
    color: '#014CC4',  // brand blue for labels like "المعلومات الشخصية:"
  },
};

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#014CC4" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      );
    }

    if (!privacyData) return null;

    return (
      <View style={[styles.contentWrapper, { direction: isRTL ? 'rtl' : 'ltr' }]}>
        {/* Title from API or fallback to localized title */}
        <Text style={[styles.pageTitle, { textAlign: isRTL ? 'left' : 'right' }]}>
          {privacyData.title || t('privacy_policy.title')}
        </Text>

        {/* Render HTML content from API with localized styles */}
        <RenderHtml
          contentWidth={width - wp(8)}
          source={{ html: privacyData.content }}
          tagsStyles={tagsStyles}
           baseStyle={{
          // direction: isRTL ? 'rtl' : 'ltr',
    // writingDirection: isRTL ? 'rtl' : 'ltr',
    fontFamily: 'System',          // or your custom Arabic font
  }}
  renderersProps={{
    ul: {
      markerBoxStyle: {
        paddingRight: isRTL ? wp(2) : 0,
        paddingLeft: isRTL ? 0 : wp(2),
      },
    },
  }}
        />

        {/* Last updated from API or fallback */}
        {privacyData.updated_at && (
          <Text style={[styles.updatedAt, { textAlign: isRTL ? 'left' : 'right' }]}>
            {t('privacy_policy.last_updated')}: {new Date(privacyData.updated_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <CustomHeader text={t('privacy_policy.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollContent: {
    padding: wp(4),
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: hp(1.5),
    fontSize: Math.min(wp(4), 16),
    color: '#666',
  },
  contentWrapper: {
    paddingHorizontal: wp(2),
  },
  pageTitle: {
    fontSize: Math.min(wp(6), 24),
    fontWeight: 'bold',
    color: '#014CC4',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  sectionText: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#333',
    lineHeight: hp(2.5),
    marginBottom: hp(2),
  },
  updatedAt: {
    fontSize: Math.min(wp(3), 12),
    color: '#999',
    marginTop: hp(3),
    fontStyle: 'italic',
  },
});

export default PrivacyPolicy;