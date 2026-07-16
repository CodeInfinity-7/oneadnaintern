'use client';

import { useRouter } from 'next/router';
import { useState } from 'react';

export default function UploadKYCPage() {
  const router = useRouter();
  const { id } = router.query;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !id) return;

    const token = localStorage.getItem('token');

    const formData = new FormData();

    // Backend expects upload.single("kyc")
    formData.append('kyc', file);

    try {
      setUploading(true);

      const res = await fetch(`/api/businesses/${id}/kyc`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert('KYC uploaded successfully');
        router.push('/businesses');
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="upload-wrapper">
        <div className="upload-card">
          <div className="upload-header">
            <h1>Upload KYC Document</h1>
          </div>

          <div className="upload-body">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="form-control mb-3"
            />

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn btn-primary w-100"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .upload-wrapper {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f3f1fd, #e9e4fc);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 15px;
        }

        .upload-card {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 3px solid #6224e1;
        }

        .upload-header {
          background-color: #6224e1;
          padding: 24px;
          text-align: center;
        }

        .upload-header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 22px;
          font-weight: bold;
        }

        .upload-body {
          padding: 24px;
        }

        @media (max-width: 480px) {
          .upload-header h1 {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}
