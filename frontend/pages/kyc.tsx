'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function KYCUploadPage() {
  const router = useRouter();
  const { id } = router.query;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selected.type)) {
      setError('Only PDF, JPG, or PNG files are allowed.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setFile(selected);
    setError('');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file || !id) {
      setMessage('File or Business ID is missing.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('kyc', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:4000/businesses/${id}/kyc`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 201) {
        setMessage('File uploaded successfully!');
        setFile(null);
        setProgress(0);
      } else {
        const res = JSON.parse(xhr.responseText);
        setError(res?.error || 'Failed to upload file.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('Upload failed due to network error.');
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-[#6224E1]">Upload KYC Document</h1>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="mb-3"
        />

        {file && (
          <div className="text-sm mb-2 text-gray-700">
            Selected: <strong>{file.name}</strong>
          </div>
        )}

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
            <div
              className="bg-[#6224E1] h-4 rounded-full text-white text-sm text-center"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          className="bg-[#6224E1] text-white px-4 py-2 rounded hover:bg-[#4a1cbf] w-full"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {message && <p className="mt-4 text-green-600 font-medium">{message}</p>}
        {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
}
