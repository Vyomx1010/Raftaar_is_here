import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './axios';

const provider = new FacebookAuthProvider();

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const { user } = result;
    const idToken = await user.getIdToken();

    // Send token to backend
    const response = await api.post('/auth/facebook', {
      token: idToken
    });

    return response.data;
  } catch (error) {
    console.error('Facebook sign in error:', error);
    throw error;
  }
};