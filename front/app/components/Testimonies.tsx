'use client';

import { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { loaderProp } from "../utils/loaderProps";

const testimoniesData = [
  {
    name: "Alice Johnson",
    role: "Project Manager",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    title: "Incredibly Helpful!",
    description: "This platform made my job search so much easier. Highly recommended!"
  },
  {
    name: "Robert Smith",
    role: "Backend Developer",
    image: "https://randomuser.me/api/portraits/men/36.jpg",
    title: "Best Experience Ever",
    description: "I was struggling with ATS filtering, but this tool gave me the edge I needed."
  },
  {
    name: "Laura Williams",
    role: "UI/UX Designer",
    image: "https://randomuser.me/api/portraits/women/62.jpg",
    title: "Smooth and Effective",
    description: "A game-changer for anyone looking to stand out in job applications."
  },
  {
    name: "James Brown",
    role: "Cybersecurity Analyst",
    image: "https://randomuser.me/api/portraits/men/70.jpg",
    title: "Helped Me Secure a Role",
    description: "Optimized my resume like never before! Got more responses than ever."
  },
  {
    name: "Emma Davis",
    role: "Data Scientist",
    image: "https://randomuser.me/api/portraits/women/29.jpg",
    title: "Highly Recommended!",
    description: "This tool saved me countless hours. Amazing results!"
  }
];

const Testimonies = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const scrollingRef = useRef(true);
  const position = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    scrollingRef.current = isScrolling;

    const totalHeight = container.scrollHeight / 2;

    const scroll = () => {
      if (!container || !scrollingRef.current) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      position.current += 0.3;
      
      if (position.current >= totalHeight) {
        position.current = 0;
      }
      
      container.scrollTop = position.current;
      
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScrolling]);

  // Handle mouse interactions
  const handleMouseEnter = () => setIsScrolling(false);
  const handleMouseLeave = () => setIsScrolling(true);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="max-w-screen-md mb-8 lg:mb-16 text-center">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">🗣️Testimonies</h2>
          <p className="text-gray-500 sm:text-xl dark:text-gray-400">Hear from our users who have experienced significant improvements in their job search through our AI-powered resume optimization and personalized guidance.</p>
      </div>
              
      <div className="relative w-full max-w-4xl h-[600px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>

        <div
          ref={containerRef}
          className="h-full overflow-y-scroll overflow-x-hidden relative"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.1) 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.1) 90%)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >

          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
            {[...Array(3)].map((_, index) => (
              <div key={`set1-${index}`} className="space-y-4">
                {testimoniesData.map((testimony, cardIndex) => (
                  <figure
                    key={`set1-${index}-${cardIndex}`}
                    className="break-inside-avoid flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{testimony.title}</h3>
                      <p className="my-4">{testimony.description}</p>
                    </blockquote>
                    <figcaption className="flex items-center justify-center">
                      <div className="relative w-9 h-9">
                        <Image
                          className="rounded-full"
                          src={testimony.image}
                          alt="profile picture"
                          fill
                          sizes="(max-width: 36px) 100vw"
                          style={{ objectFit: 'cover' }}
                          loader={loaderProp}
                          unoptimized
                        />
                      </div>
                      <div className="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
                        <div>{testimony.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{testimony.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
          
          <div className="space-y-4 columns-2 md:columns-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={`set2-${index}`} className="space-y-4">
                {testimoniesData.map((testimony, cardIndex) => (
                  <figure
                    key={`set2-${index}-${cardIndex}`}
                    className="break-inside-avoid flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{testimony.title}</h3>
                      <p className="my-4">{testimony.description}</p>
                    </blockquote>
                    <figcaption className="flex items-center justify-center">
                      <div className="relative w-9 h-9">
                        <Image
                          className="rounded-full"
                          src={testimony.image}
                          alt="profile picture"
                          fill
                          sizes="(max-width: 36px) 100vw"
                          style={{ objectFit: 'cover' }}
                          loader={loaderProp}
                          unoptimized
                        />
                      </div>
                      <div className="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
                        <div>{testimony.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{testimony.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonies;