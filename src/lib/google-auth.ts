import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './axios';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const { user } = result;
    const idToken = await user.getIdToken();

    // Send token to backend
    const response = await api.post('/auth/google', {
      token: idToken
    });

    return response.data;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};