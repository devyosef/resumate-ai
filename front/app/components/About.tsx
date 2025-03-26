'use client';

import Marquee from "react-fast-marquee";
import Image from "next/image";
import { loaderProp } from "../utils/loaderProps";

const About = () => {
    const scrollToForm = (e: React.MouseEvent) => {
        e.preventDefault();
        const form = document.getElementById('upload-form');
        form?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div className="max-w-screen-md mb-8 lg:mb-16 mx-auto text-center mt-11">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
                🛠️Technologies & Tools
                </h2>
                <p className="text-gray-500 sm:text-xl dark:text-gray-400">
                    This project harnesses the power of cloud computing, OpenAI API models, and advanced programming tools to deliver optimal performance and innovation.
                </p>
                </div>
            <div className="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
                <div className="flex flex-wrap justify-center items-center mt-8 text-gray-500 sm:justify-between">
                    <Marquee speed={20} gradient={true} className="space-x-16">
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/nextjs.svg"
                                alt="Next.js Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                      
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/typescript.svg"
                                alt="TypeScript Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/tailwind.svg"
                                alt="TypeScript Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/python.svg"
                                alt="Python Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/aws.svg"
                                alt="AWS Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/docker.svg"
                                alt="Docker Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/terraform.svg"
                                alt="Terraform Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/websocket.svg"
                                alt="WebSocket Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                       <div style={{marginRight: '55px'}}>
                       <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                            <Image
                                src="/assets/images/openai.svg"
                                alt="OpenAI Logo"
                                width={800}
                                height={800}
                                className="dark:invert transition-all duration-300 opacity-50 group-hover:opacity-100"
                                style={{ width: '100px', height: 'auto' }}
                                loader={loaderProp}
                                unoptimized
                            />                        
                        </a>
                       </div>
                    </Marquee>   
                </div>
            </div> 
       
            <section className="bg-white px-4 py-8 antialiased md:py-16">
                <div className="mx-auto max-w-screen-xl">
                    <div className="bg-gradient-to-br from-[#3D8D7A] to-[#A3D1C6] rounded-xl shadow-lg p-4 md:p-8 lg:p-16 overflow-hidden relative">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-16 relative z-10">
                            <div className="lg:col-span-5 lg:mt-0">
                                <a href="#" className="group hover:text-gray-800 dark:hover:text-gray-400">
                                    <Image
                                        src="/assets/images/career.svg"
                                        alt="OpenAI Logo"
                                        width={800}
                                        height={800}
                                        className="dark:invert "
                                        style={{ width: '400px', height: 'auto' }}
                                        loader={loaderProp}
                                        unoptimized
                                    />                        
                                </a>
                            </div>
                            <div className="me-auto place-self-center lg:col-span-7">
                                <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                                    Land more interviews with AI-powered resume optimization
                                </h1>
                                <p className="mb-6 text-white/90 dark:text-white/90">
                                    Our intelligent system analyzes your resume and job descriptions to create perfectly tailored applications while maintaining your authentic experience. No more manual rewording.
                                </p>
                                <a 
                                    href="#upload-form"
                                    onClick={scrollToForm}
                                    className="inline-flex items-center justify-center rounded-lg bg-[#FBFFE4] px-5 py-3 text-center text-base font-medium hover:bg-gray-100 focus:ring-4 focus:ring-white/30"
                                > 
                                    👉 Try for free
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;