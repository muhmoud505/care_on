import { API_URL } from '@env';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';

import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';


import Check from '../../components/check';

import FormField from '../../components/FormInput';

import { HomeHeader } from '../../components/homeHeader';

import Uploader from '../../components/Uploader';

import { useAuth } from '../../contexts/authContext'; // 1. Import useAuth





const Survey = () => {

  const navigation = useNavigation();

  const { t } = useTranslation();

  const [questions, setQuestions] = useState([]);

  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);

  const [questionsError, setQuestionsError] = useState(null);

  const [answers, setAnswers] = useState({});

  const [notes, setNotes] = useState('');

  const [file, setFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth(); // 2. Get user object from context

  const token = user?.token?.value;



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

        return setIsQuestionsLoading(false);

      }

      try {

        const response = await fetch(`${API_URL}/api/v1/questions`, {

          headers: {

            'Authorization': `Bearer ${token}`,

            'Accept': 'application/json',

            'lang':'ar'

          },

        });

        const result = await response.json();

        if (response.ok) {

          // Map API response to the format your component expects

          const formattedQuestions = result.data.map(q => {

            // The API returns an array of answer objects. We need to map them for the Check component.

            const answerOptions = q.answers.map(a => a.content); // e.g., ['نعم', 'لا']

            return {

              id: q.id, // Use the API ID directly

              q: q.content, // The question text is in 'content'

              ans: answerOptions,

              required: q.is_required || false, // Assuming is_required exists

            };

          });

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

        // Use the question's ID for the backend

        formData.append(`answers[${index}][question_id]`, question.id);

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

      console.log(token);

      

      const response = await fetch(`${API_URL}/api/v1/answers`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${token}`, // Use the actual token from the user object

          'Accept': 'application/json', // Inform the server that we expect a JSON response

          // 'Content-Type' is set automatically by fetch for FormData

        },

        body: formData,

      });

      

      const result = await response.json();



      if (response.ok) {

        // On successful submission, set the flag in AsyncStorage to prevent the popup from showing again.

        const userId = user?.user?.id;

        if (userId) {

          const surveyStatusKey = `hasCompletedSurvey_${userId}`;

          await AsyncStorage.setItem(surveyStatusKey, 'true');

        }



        Toast.show({
          type: 'success',
          text1: t('survey.success_title'),
          text2: t('survey.success_message'),
          position: 'top',
          visibilityTime: 3000,
        });

        navigation.goBack();

      } else {

        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: result.message || t('survey.submit_failed'),
          position: 'top',
          visibilityTime: 3000,
        });
      }

    } catch (error) {
      console.error('Submission Error:', error);

      // Provide a more specific error message for network failures.

      if (error instanceof TypeError && error.message === 'Network request failed') {

        Toast.show({
          type: 'error',
          text1: t('survey.network_error'),
          text2: t('survey.network_error_message'),
          position: 'top',
          visibilityTime: 3000,
        });
      } else {

        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('survey.unexpected_error'),
          position: 'top',
          visibilityTime: 3000,
        });
      }

    } finally {

      setIsSubmitting(false);

    }

  };

  if (questionsError) {

    return (
      <SafeAreaView style={styles.mainContainer}>
        <HomeHeader showUserInfo={false}/>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('survey.error_prefix')}{questionsError}</Text>
        </View>
        <Toast />
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

          title={t('survey.notes_prompt')}

          placeholder={t('survey.notes_placeholder')}

          value={notes}

          onChangeText={setNotes} // Assuming 'FormField' has an onChangeText prop

          type="long" // Make the text input multiline for better UX

        />



        <Uploader

          title={t('survey.file_prompt')}

          onFileSelect={setFile} // Assuming 'Uploader' has an onFileSelect prop

        />

        <TouchableOpacity

          onPress={handleSubmit} // The 'disabled' prop handles pressability

          activeOpacity={0.7}

          style={[styles.btn, (!isFormValid || isSubmitting) && styles.disabledBtn]} // eslint-disable-line react-native/no-inline-styles

          disabled={!isFormValid || isSubmitting}

        >

          <Text style={styles.txt}>

            {isSubmitting ? t('survey.submitting') : t('survey.submit')}

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