export const validators = {
  password: /^(?=.*[A-Za-z])(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  image: /\.(jpe?g|png|gif|webp|svg)$/i,
  fourteenDigits: /^\d{14}$/,
  fourDigits: /^\d{4}$/,
};


export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!validators.email.test(email)) return 'Invalid email format';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (!validators.password.test(password)) 
    return '8+ chars with letters and symbols (@#$!%*?&)';
  return '';
};

export const validateNationalId = (nationalId) => {
  if (!nationalId) return 'National ID is required';
  if (!validators.fourteenDigits.test(nationalId)) 
    return 'Must be exactly 14 digits';
  return '';
};

export const validatePinCode = (pinCode) => {
  if (!pinCode) return 'PIN is required';
  if (!validators.fourDigits.test(pinCode)) 
    return 'Must be exactly 4 digits';
  return '';
};

export const validateImageUri = (imageUri) => {
  // Check if imageUri exists and has a uri property
  if (imageUri?.uri) {
    const uri = imageUri.uri.toLowerCase();
    if (!validators.image.test(uri)) {
      return 'Only .jpg, .png, .gif, .webp, .svg allowed';
    }
  } else if (imageUri) { // Handle case where it might be a string
    const uri = imageUri.toLowerCase();
    if (!validators.image.test(uri)) {
      return 'Only .jpg, .png, .gif, .webp, .svg allowed';
    }
  }
  return '';
};

// Add this new validator for name field
export const validateName = (name) => {
  if (!name?.trim()) return 'Name is required';
  return '';
};