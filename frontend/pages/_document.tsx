// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* ✅ Bootstrap 5.3 CDN */}
       <link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  rel="stylesheet"
/>


  {/* Google Font: Poppins */}
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />

  {/* Custom global styles */}
  <style>{`
    body {
      font-family: 'Poppins', sans-serif;
      background-color: #f8f8ff;
    }
    .bg-primary-custom {
      background-color: #6224E1;
    }
    .text-primary-custom {
      color: #6224E1;
    }
    .border-primary-custom {
      border-color: #6224E1 !important;
    }
    .btn-primary-custom {
      background-color: #6224E1;
      color: #fff;
      border: none;
    }
    .btn-primary-custom:hover {
      background-color: #4d1db4;
    }
      .border-primary-custom {
  border-color: #6224E1 !important;
}

  `}
  </style>



      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
