import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ImageUpload = ({ images, onChange, maxFiles = 5, maxSize = 5 * 1024 * 1024 }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        if (file.errors[0].code === 'file-too-large') {
          toast.error(`El archivo ${file.file.name} es demasiado grande (máx 5MB)`);
        } else {
          toast.error(`Error al subir ${file.file.name}`);
        }
      });
    }

    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    onChange([...images, ...newImages].slice(0, maxFiles));
  }, [images, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
    maxFiles: maxFiles - images.length
  });

  const removeImage = (id) => {
    onChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Suelta las imágenes aquí'
            : 'Arrastra imágenes o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF hasta 5MB (máx {maxFiles} imágenes)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.preview || image.url}
                alt="Preview"
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;