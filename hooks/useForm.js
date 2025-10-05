import { useState } from "react";
import {
    validateEmail,
    validateImageUri,
    validateName,
    validateNationalId,
    validatePassword,
    validatePinCode
} from "../utils/validators";

const useForm = (initialState) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  
  const handleChange = (fieldName, value) => {
    setForm(prev => ({...prev, [fieldName]: value}));
  };

  const validateField = (fieldName, value) => {
    let error = '';
    switch (fieldName) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'nationalId':
        error = validateNationalId(value);
        break;
      case 'pinCode':
        error = validatePinCode(value);
        break;
      case 'imageUri':
        error = validateImageUri(value);
        break;
      case 'name':
        error = validateName(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({...prev, [fieldName]: error}));
    return !error;
  };

  const checkFormValidity = () => {
    return Object.keys(form).every(field => {
      const value = form[field];
      switch (field) {
        case 'name':
          return !validateName(value);
        case 'email':
          return !validateEmail(value);
        case 'nationalId':
          return !validateNationalId(value);
        case 'imageUri':
        // Check both existence of file and valid extension
        return value?.uri && !validateImageUri(value);
        default:
          return true;
      }
    });
  };

  return {
    form,
    errors,
    handleChange,
    validateField,
    checkFormValidity,
    setForm
  };
};

export default useForm;