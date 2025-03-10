import React, { useState } from 'react';

const ImageEditor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilter = (filterType) => {
    if (!originalImage) return;

    setLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        switch (filterType) {
          case 'grayscale':
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            data[i] = data[i + 1] = data[i + 2] = gray;
            break;
          case 'sepia':
            data[i] = (r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = (r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = (r * 0.272 + g * 0.534 + b * 0.131);
            break;
          case 'watermark':
            ctx.font = '100px Arial';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Hello', canvas.width / 2, canvas.height / 2);
            break;
        }
      }

      if (filterType !== 'watermark') {
        ctx.putImageData(imageData, 0, 0);
      }

      setProcessedImage(canvas.toDataURL());
      setLoading(false);
    };
    img.src = originalImage;
  };

  const resizeImage = () => {
    if (!originalImage) return;

    setLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;
      
      ctx.drawImage(img, 0, 0, 256, 256);
      setProcessedImage(canvas.toDataURL());
      setLoading(false);
    };
    img.src = originalImage;
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Image Editor</h2>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="mb-4"
      />

      {originalImage && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Original Image</h3>
          <img 
            src={originalImage} 
            alt="Original" 
            className="max-w-full h-auto mb-2"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => applyFilter('grayscale')}
          disabled={!originalImage || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Grayscale
        </button>
        <button 
          onClick={() => applyFilter('sepia')}
          disabled={!originalImage || loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Sepia
        </button>
        <button 
          onClick={resizeImage}
          disabled={!originalImage || loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Resize
        </button>
        <button 
          onClick={() => applyFilter('watermark')}
          disabled={!originalImage || loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Add Watermark
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-500">Processing...</div>
      )}

      {processedImage && (
        <div>
          <h3 className="font-semibold mb-2">Processed Image</h3>
          <img 
            src={processedImage} 
            alt="Processed" 
            className="max-w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;