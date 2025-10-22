import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserPreferences {
  language: "en" | "ru" | "ka";
  theme: "light" | "dark" | "system";
  notifications: boolean;
  defaultCity?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  preferences: UserPreferences;
  savedEvents: string[];
  savedPlaces: string[];
  createdAt: Date;
  updatedAt: Date;
}

const defaultPreferences: UserPreferences = {
  language: "en",
  theme: "light",
  notifications: true,
};

// Получить профиль пользователя
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Создать профиль пользователя
export const createUserProfile = async (
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null
): Promise<void> => {
  try {
    const userProfile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
      uid,
      email,
      displayName,
      photoURL,
      preferences: defaultPreferences,
      savedEvents: [],
      savedPlaces: [],
    };

    await setDoc(doc(db, "users", uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Обновить профиль пользователя
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Обновить настройки пользователя
export const updateUserPreferences = async (
  uid: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      const currentPreferences =
        userDoc.data().preferences || defaultPreferences;
      const updatedPreferences = { ...currentPreferences, ...preferences };

      await updateDoc(doc(db, "users", uid), {
        preferences: updatedPreferences,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};
