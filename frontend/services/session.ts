// Persists the logged-in user's username on the device so every screen
// (all / unread / pending / groups / status) knows which account to load
// data for, without having to pass it through every router.push() call.

import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "niningo_username";
const NAME_KEY = "niningo_name";
const PROFILE_IMAGE_KEY = "niningo_profile_image";

export async function saveSession(params: {
  username: string;
  name?: string;
  profileImage?: string | null;
}) {
  const { username, name, profileImage } = params;
  await AsyncStorage.setItem(USERNAME_KEY, username);
  if (name) await AsyncStorage.setItem(NAME_KEY, name);
  if (profileImage) await AsyncStorage.setItem(PROFILE_IMAGE_KEY, profileImage);
}

export async function getUsername(): Promise<string | null> {
  return AsyncStorage.getItem(USERNAME_KEY);
}

export async function getSession() {
  const [username, name, profileImage] = await Promise.all([
    AsyncStorage.getItem(USERNAME_KEY),
    AsyncStorage.getItem(NAME_KEY),
    AsyncStorage.getItem(PROFILE_IMAGE_KEY),
  ]);
  return { username, name, profileImage };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([USERNAME_KEY, NAME_KEY, PROFILE_IMAGE_KEY]);
}
