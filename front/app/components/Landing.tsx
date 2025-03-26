"use client";

import TypewriterComponent from "typewriter-effect";
import { useState } from "react";
import HowItWorksModal from "./HowItWorksModal";

const Landing = () => {
  const [showModal, setShowModal] = useState(false);

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = document.getElementById('upload-form');
    form?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="dark:bg-gray-900">
      <div className="py-8 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-white bg-opacity-30 backdrop-blur-xl shadow-lg dark:bg-opacity-30 dark:bg-gray-800 px-8 py-10">
          <a
            href="#"
            className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            role="alert"
          >
            <span
              style={{ backgroundColor: '#3D8D7A' }}
              className="text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3"
            >
              New
            </span>
            <span className="text-sm font-medium"><strong>ResuMate</strong> is out! See what&apos;s new</span>
            <svg
              className="ml-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </a>
          <div className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            <div className="flex flex-wrap items-center justify-center">
              <span>🎯Land more&nbsp;</span>
              <TypewriterComponent
                options={{
                  strings: [
                    "interviews!",
                    "offers!",
                    "callbacks!",
                    "responses!",
                    "opportunities!",
                    "jobs!",
                    "positions!",
                    "roles!",
                  ],
                  autoStart: true,
                  loop: true,
                  wrapperClassName: 'text-white',
                  cursorClassName: 'text-white',
                }}
              />
            </div>
            <div className="mt-3">We optimize your career potential</div>
          </div>
          <p
            className="mb-8 text-lg font-normal text-black-500 lg:text-xl sm:px-16 xl:px-48 dark:text-black"
          >
            <strong>ResuMate</strong> uses advanced AI to intelligently adapt your resume to job descriptions while maintaining your authentic experience and achievements.
          </p>
          <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a
              href="#upload-form"
              onClick={scrollToForm}
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-black rounded-lg focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
              style={{ backgroundColor: '#FBFFE4' }}
            >
              Try now 👉
            </a>
            <button
              onClick={() => setShowModal(true)}
              style={{ backgroundColor: '#3D8D7A' }}
              className="text-white inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
              ℹ️ How it works
            </button>
          </div>
        </div>
      </div>

      <HowItWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
};

export default Landing;
