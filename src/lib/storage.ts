import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  if (!file) throw new Error('No file provided');
  
  // Create a unique filename
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the public URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
