import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Check for age verification
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      toast.custom(
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-bold mb-2">Age Verification</h3>
          <p className="text-sm mb-4">You must be 18+ to play. Do you confirm?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.setItem('ageVerified', 'true');
                toast.dismiss();
              }}
              className="flex-1 bg-simbi-gold text-black py-2 rounded font-bold"
            >
              I Confirm
            </button>
            <button
              onClick={() => {
                window.location.href = 'https://google.com';
              }}
              className="flex-1 bg-gray-300 py-2 rounded"
            >
              Exit
            </button>
          </div>
        </div>,
        { duration: Infinity }
      );
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </>
  );
}
