import { useEffect, useState } from "react";

interface StatisticsProps {
    percentage_before: number;
    percentage_after: number;
    percentage_of_optimization: number;
}

const Statistics = ({ percentage_before, percentage_after, percentage_of_optimization }: StatisticsProps) => {
    const [progress, setProgress] = useState([0, 0, 0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) =>
                prev.map((val, index) => {
                    const targetValue = index === 0 ? percentage_before : 
                                      index === 1 ? percentage_after : 
                                      percentage_of_optimization;
                    if (val >= targetValue) return targetValue;
                    return val + 1;
                })
            );
        }, 20);
        return () => clearInterval(interval);
    }, [percentage_before, percentage_after, percentage_of_optimization]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* First Chart - Orange */}
            <div className="relative size-40">
                <svg
                    className="rotate-[135deg] size-full"
                    viewBox="0 0 36 36"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-orange-200"
                        strokeWidth="1"
                        strokeDasharray="75 100"
                        strokeLinecap="round"
                    ></circle>
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-orange-500 transition-all duration-1000"
                        strokeWidth="2"
                        strokeDasharray={`${progress[0] * 0.75} 100`}
                        strokeLinecap="round"
                    ></circle>
                </svg>
                <div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-bold text-orange-600">{progress[0]}%</span>
                    <span className="text-orange-600 block">Before Analyse</span>
                </div>
            </div>

            {/* Second Chart - Purple */}
            <div className="relative size-40">
                <svg
                    className="rotate-[135deg] size-full"
                    viewBox="0 0 36 36"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-purple-200"
                        strokeWidth="1"
                        strokeDasharray="75 100"
                        strokeLinecap="round"
                    ></circle>
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-purple-500 transition-all duration-1000"
                        strokeWidth="2"
                        strokeDasharray={`${progress[1] * 0.75} 100`}
                        strokeLinecap="round"
                    ></circle>
                </svg>
                <div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-bold text-purple-600">{progress[1]}%</span>
                    <span className="text-purple-600 block">After Analyse</span>
                </div>
            </div>

            {/* Third Chart - Green */}
            <div className="relative size-40">
                <svg
                    className="rotate-[135deg] size-full"
                    viewBox="0 0 36 36"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-green-200"
                        strokeWidth="1"
                        strokeDasharray="75 100"
                        strokeLinecap="round"
                    ></circle>
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-green-500 transition-all duration-1000"
                        strokeWidth="2"
                        strokeDasharray={`${progress[2] * 0.75} 100`}
                        strokeLinecap="round"
                    ></circle>
                </svg>
                <div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-bold text-green-600">{progress[2]}%</span>
                    <span className="text-green-600 block">Optimization</span>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
