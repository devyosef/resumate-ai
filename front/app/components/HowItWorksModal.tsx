'use client';

import { useEffect } from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksModal = ({ isOpen, onClose }: HowItWorksModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-2xl mx-4 transform transition-all duration-300 ease-in-out"
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              How to Use ResuMate
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors duration-200"
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-start transform transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3D8D7A] flex items-center justify-center text-white font-bold">1</div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Your Resume</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">Start by uploading your current resume in PDF format. Our system will analyze its content and structure.</p>
                </div>
              </div>
              <div className="flex items-start transform transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3D8D7A] flex items-center justify-center text-white font-bold">2</div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Paste Job Description</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">Copy and paste the job description you&apos;re applying for. Our AI will identify key requirements and qualifications.</p>
                </div>
              </div>
              <div className="flex items-start transform transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3D8D7A] flex items-center justify-center text-white font-bold">3</div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">Our AI analyzes your resume against the job requirements, identifying areas for optimization.</p>
                </div>
              </div>
              <div className="flex items-start transform transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3D8D7A] flex items-center justify-center text-white font-bold">4</div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Get Optimized Resume</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">Receive your optimized resume that&apos;s tailored to the job description while maintaining your authentic experience.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              onClick={onClose}
              type="button"
              className="text-white bg-[#3D8D7A] hover:bg-[#2D6D5A] focus:ring-4 focus:outline-none focus:ring-[#3D8D7A] font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-[#3D8D7A] dark:hover:bg-[#2D6D5A] dark:focus:ring-[#3D8D7A] transition-colors duration-200"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HowItWorksModal; 