import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Check from '../../components/check';
import FormField from '../../components/FormInput';
import { HomeHeader } from '../../components/homeHeader';
import Uploader from '../../components/Uploader';
import { useAuth } from '../../contexts/authContext'; // 1. Import useAuth



const Survey = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // 2. Get user object from context
  const token = user?.data?.token;

  // Memoize the validity check to prevent recalculating on every render
  const isFormValid = useMemo(() => {
    return questions.every(question => {
      // If a question is not required, it's considered valid.
      // If it is required, it must have an answer in the state.
      return !question.required || !!answers[question.id];
    });
  }, [answers]);
  // Handler to update the state when a checkbox answer changes
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setQuestionsError('Authentication token not found.');
        setIsQuestionsLoading(false);
      }
      try {
        const response = await fetch(`${API_URL}/api/v1/questions`, {
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Accept': 'application/json',
            'lang':'ar'
          },
        });
        const result = await response.json();
        if (response.ok) {
          // Map API response to the format your component expects
          const formattedQuestions = result.data.map(q => ({
            id: `q_${q.id}`, // Unique ID for local state management
            api_id: q.id,    // ID to send back to the API
            q: q.question_text,
            ans: q.options || ['نعم', 'لا'], // Fallback options
            required: q.is_required || false,
          }));
          setQuestions(formattedQuestions);
        } else {
          throw new Error(result.message || 'Failed to fetch questions.');
        }
      } catch (error) {
        setQuestionsError(error.message);
      } finally {
        setIsQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  // Handler for form submission
  const handleSubmit = async () => {
    if (!isFormValid) return;
    console.log('hi');
    
    setIsSubmitting(true);

    // Use FormData to send text and files together
    const formData = new FormData();

    // Append answers
    questions.forEach((question, index) => {
      if (answers[question.id]) {
        // Use the numeric api_id for the backend
        formData.append(`answers[${index}][question_id]`, question.api_id);
        formData.append(`answers[${index}][text]`, answers[question.id]);
      }
    });

    // Append notes if they exist
    if (notes) {
      formData.append('notes', notes);
    }

    // Append file if it exists
    if (file) {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
    }
    console.log('hiiii');
    
    
    try {
      console.log(token.value);
      
      const response = await fetch(`${API_URL}/api/v1/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`, // Use the actual token from the user object
          'Accept': 'application/json', // Inform the server that we expect a JSON response
          // 'Content-Type' is set automatically by fetch for FormData
        },
        body: formData,
      });
      
      const result = await response.json();

      if (response.ok) {
        Alert.alert('نجاح', 'تم إرسال الاستبيان بنجاح.');
        navigation.goBack();
      } else {
        Alert.alert('خطأ', result.message || 'فشل في إرسال الاستبيان.');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      // Provide a more specific error message for network failures.
      if (error instanceof TypeError && error.message === 'Network request failed') {
        Alert.alert('خطأ في الشبكة', 'تعذر الوصول إلى الخادم. يرجى التحقق من اتصالك بالإنترنت وإعدادات الخادم.');
      } else {
        Alert.alert('خطأ', 'حدث خطأ غير متوقع.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isQuestionsLoading) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <HomeHeader showUserInfo={false}/>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#80D280" />
          <Text>جاري تحميل الأسئلة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questionsError) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <HomeHeader showUserInfo={false}/>
        <View style={styles.centered}>
          <Text style={styles.errorText}>خطأ: {questionsError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <HomeHeader showUserInfo={false}/>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
        {questions.map((item) => (
          <Check
            key={item.id}
            q={item.q}
            ans={item.ans}
            required={item.required}
            // Assuming 'Check' component takes value and onValueChange props
            value={answers[item.id]}
            onValueChange={(value) => handleAnswerChange(item.id, value)}
          />
        ))}

        <FormField
          title={'اذا كنت ترغب في مشاركة اي ملاحظات'}
          placeholder={'ملاحظات'}
          value={notes}
          onChangeText={setNotes} // Assuming 'FormField' has an onChangeText prop
          type="long" // Make the text input multiline for better UX
        />

        <Uploader
          title={'اذا كنت ترغب في مشاركة اي ملف'}
          onFileSelect={setFile} // Assuming 'Uploader' has an onFileSelect prop
        />
        <TouchableOpacity
          onPress={handleSubmit} // The 'disabled' prop handles pressability
          activeOpacity={0.7}
          style={[styles.btn, (!isFormValid || isSubmitting) && styles.disabledBtn]}
          disabled={!isFormValid || isSubmitting}
        >
          <Text style={styles.txt}>
            {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Survey

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        backgroundColor: '#fff',
    },
    container:{
        direction:'rtl',
        backgroundColor:'#fff',
        paddingHorizontal:20,
        paddingVertical: 20,
        paddingBottom: 100, // Add padding to the bottom to ensure button is visible above tabs
        rowGap: 20,
    },
    btn:{
      width:327,
      height:56,
      backgroundColor:'#80D280',
      borderRadius:16,
      alignItems:'center',
      justifyContent:'center',
      alignSelf: 'center',
    },
    disabledBtn: {
      backgroundColor: '#A9A9A9',
    },
    txt:{
      fontSize:24,
      fontWeight:700,
     textAlign:'center',
     color:'#FFFFFF'
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    errorText: {
      color: 'red',
      fontSize: 16,
    }
   
})