import { useMemo } from 'react';
import { useAuth } from '../../../contexts/authContext';
import ChildProfile from './ChildProfile';
import ParentProfile from './ParentProfile';

const ProfileScreen = () => {
  const { user } = useAuth();

  const age = useMemo(() => {
    const birthdate = user?.user?.resource?.birthdate; // YYYY-MM-DD format
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

  // A user is considered a child if their age is less than 18.
  const isChild = age !== null && age < 18;

  return isChild ? <ChildProfile /> : <ParentProfile />;
};

export default ProfileScreen;