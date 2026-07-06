// We bypass Firebase Storage entirely to avoid Blaze plan requirements.
// Instead, we compress images heavily and save them as Base64 strings directly in the RTDB.

export async function uploadFile(file: File, _folder?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Only images are supported for this compression method.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Max dimensions to keep Base64 strings tiny
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress heavily (quality 0.5) to ensure strings don't bloat the RTDB limits
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
