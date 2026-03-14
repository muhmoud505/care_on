import { useMemo } from 'react';
import { useAuth } from '../../../contexts/authContext';
import ChildProfile from './ChildProfile';
import ParentProfile from './ParentProfile';

const ProfileScreen = () => {
  const { user, isImpersonating } = useAuth();

  const age = useMemo(() => {
    // Add null check for user and user.user to prevent errors during account switching
    if (!user || !user.user || !user.user.resource) {
      return null;
    }
    
    const birthdate = user.user.resource.birthdate; // YYYY-MM-DD format
    if (!birthdate) {
      return null; // Cannot determine age
    }
    try {
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) throw new Error('Invalid date');

      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      return calculatedAge;
    } catch (e) {
      console.error("Failed to calculate age from birthdate:", e);
      return null;
    }
  }, [user]);
  console.log('ProfileScreen Debug:', { age, isImpersonating });

  // A user is considered a child if they are impersonated or their age is less than 18.
  const isChild = isImpersonating || (age !== null && age < 18);

  return isChild ? <ChildProfile /> : <ParentProfile />;
};

export default ProfileScreen;