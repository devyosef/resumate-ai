'use client';

import { useState, useEffect } from "react";
import Statistics from "./ui/Statistics";
import pdfImage from '../assets/images/pdf.png';
import Image from 'next/image';
import { loaderProp } from "../utils/loaderProps";

const Form = () => {
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [optimizedPdfUrl, setOptimizedPdfUrl] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);
    const [stats, setStats] = useState({
        percentage_before: 0,
        percentage_after: 0,
        percentage_of_optimization: 0
    });

    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    const handleUpload = async () => {
        try {
            setSubmitted(true);
            setProcessingStatus('📤 Uploading file...');
            
            // Create FormData and append file
            const formData = new FormData();
            formData.append('file', file!);
            
            // Upload file to S3
            const response = await fetch('/api/s3', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            
            setProcessingStatus('🔌 Connecting to server...');
            
            const wsUrl: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL!;
            const websocket = new WebSocket(wsUrl);
            
            websocket.onopen = () => {
                setProcessingStatus('Connected to server...');
                
                const payload = {
                    action: "process_resume",
                    data: {
                        jobDescription,
                        fileKey: data.fileKey
                    }
                };
                websocket.send(JSON.stringify(payload));
            };

            websocket.onmessage = (event) => {
                const response = JSON.parse(event.data);
                
                switch (response.status) {
                    case 'complete':
                        if (response.data) {
                            setStats({
                                percentage_before: response.data.percentage_before,
                                percentage_after: response.data.percentage_after,
                                percentage_of_optimization: response.data.percentage_after - response.data.percentage_before
                            });
                            setOptimizedPdfUrl(response.data.presigned_url);
                            setProcessingStatus('🎉 Optimization complete! Your resume is ready for download.');
                            setSubmitted(false); // Process is complete, no longer submitting
                        }
                        break;

                    case 'processing':
                        switch (response.message) {
                            case 'Processing started':
                                setProcessingStatus('📤 Starting resume processing...');
                                break;
                            case 'Analyzing with AI':
                                setProcessingStatus('🤖 AI is analyzing your resume...');
                                break;
                            case 'Generating new resume':
                                setProcessingStatus('✨ Generating your optimized resume...');
                                break;
                            default:
                                setProcessingStatus(response.message || 'Processing...');
                        }
                        break;

                    case 'error':
                        console.log(response.message);
                        setSubmitted(false);
                        break;

                    default:
                        setProcessingStatus('Processing...');
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setSubmitted(false);
                setShowError(true);
            };

            websocket.onclose = () => {
                if (processingStatus !== '🎉 Optimization complete! Your resume is ready for download.') {
                    setSubmitted(false);
                    setShowError(true);
                }
            };

            setWs(websocket);

        } catch (error: unknown) {
            console.error('Error uploading file:', error);
            setSubmitted(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setJobDescription('');
        setProcessingStatus('');
        setOptimizedPdfUrl('');
        setStats({
            percentage_before: 0,
            percentage_after: 0,
            percentage_of_optimization: 0
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    return (
        <section id="upload-form" className="bg-white dark:bg-gray-900">
            <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">🚀Start Your Job Search Success</h2>
                <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">Be ready to increase your interview chances</p>
                <form action="#" className="space-y-8">
                    <div className="sm:col-span-2">
                        <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Job Description</label>
                        <textarea 
                            id="message" 
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)} 
                            rows={6} 
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                            placeholder="eg: We are looking for an experienced software developer..."
                        ></textarea>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center"><span className="font-semibold">Click to upload</span> or drag and drop your current resume</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF only (MAX. 1 file)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                    </div>
                    {file && (
                        <div className="flex items-center justify-between bg-[#FBFFE4] mt-4 border border-gray-300 rounded-lg p-2">
                            <div className="flex items-center">
                                <Image 
                                    src={pdfImage} 
                                    alt="PDF icon" 
                                    width={50} 
                                    height={50}
                                    priority
                                    loader={loaderProp}
                                    unoptimized
                                />
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{file.name}</span>
                            </div>
                            <button onClick={removeFile} className="flex items-center text-red-500 hover:text-red-700">
                            🗑️
                            </button>
                        </div>
                    )}
                    <button 
                        disabled={submitted || !jobDescription || !file} 
                        onClick={handleUpload} 
                        type="button" 
                        className={`py-3 px-5 text-sm font-medium text-center text-white rounded-lg sm:w-fit focus:ring-4 focus:outline-none focus:ring-primary-300 mx-auto block ${
                            submitted || !jobDescription || !file
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-[#6AA98C] hover:bg-[#B3D8A8] focus:ring-primary-800'
                        }`}
                    >
                        {submitted ? (
                            <span className="flex items-center justify-center">
                                <span className="mr-2">{processingStatus}</span>
                                <span className="animate-spin">⏳</span>
                            </span>
                        ) : (
                            'Upload and Analyze 📤'
                        )}
                    </button>
    

                    {optimizedPdfUrl && (
                        <div className="mt-4 flex justify-center">
                            <a
                                href={optimizedPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-3 bg-[#6AA98C] text-white rounded-lg hover:bg-[#B3D8A8] transition-colors duration-200"
                            >
                                💾 
                                <strong>Download Optimized Resume</strong>
                            </a>
                        </div>
                    )}

                    {stats.percentage_before > 0 && (
                        <Statistics 
                            percentage_before={stats.percentage_before}
                            percentage_after={stats.percentage_after}
                            percentage_of_optimization={stats.percentage_of_optimization}
                        />
                    )}
                </form>
                {showError && (
                    <div id="alert-border-2" className="my-4 flex items-center p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800" role="alert">
                        <svg className="shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            An error occurred while processing your resume. Please try again later.
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setShowError(false)}
                            className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" 
                            aria-label="Close"
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Form;