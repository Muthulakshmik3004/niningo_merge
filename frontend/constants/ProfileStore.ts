import AsyncStorage from "@react-native-async-storage/async-storage";

type ProfileData = {
  name: string;
  username: string;
  bio: string;
  language: string;
  gender: string;
  theme: string;
  profile_image: string | null;
};

const PROFILE_STORAGE_KEY = "niningo_current_profile";

let currentProfile: ProfileData | null = null;
let storageReady: Promise<void> | null = null;

async function loadFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      currentProfile = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load profile from storage:", e);
  }
}

async function saveToStorage(profile: ProfileData) {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile to storage:", e);
  }
}

storageReady = loadFromStorage();

export const setCurrentProfile = async (profile: ProfileData) => {
  currentProfile = profile;
  await saveToStorage(profile);
};

export const getCurrentProfile = () => currentProfile;

export const getCurrentProfileAsync = async () => {
  if (storageReady) {
    await storageReady;
  }
  return currentProfile;
};

export const clearCurrentProfile = async () => {
  currentProfile = null;
  try {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear profile from storage:", e);
  }
};
