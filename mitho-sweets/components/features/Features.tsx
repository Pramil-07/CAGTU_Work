import React from 'react';
import Image from 'next/image';
import { useMantineTheme } from '@mantine/core';

// Define TypeScript interface for feature items
interface Feature {
    title: string;
    image: string;
    color: string;
}

const Features: React.FC = () => {
    const theme = useMantineTheme();

    const information: Feature[] = [
        { title: 'Free Shipping', image: '/assets/f1.png', color: 'text-red-500' },
        { title: 'Online Order', image: '/assets/feature-2.png', color: 'text-blue-500' },
        { title: 'Save Money', image: '/assets/feature-3.png', color: 'text-green-500' },
        { title: 'Promotions', image: '/assets/feature-4.png', color: 'text-yellow-500' },
        { title: 'Happy Sell', image: '/assets/feature-5.png', color: 'text-purple-500' },
        { title: '24/7 Support', image: '/assets/feature-6.png', color: 'text-pink-500' },
    ];

    const getBackgroundClass = (colorClass: string): string => {
        const colorMap: { [key: string]: string } = {
            'text-red-500': 'bg-[#FDDDE4]', // Lighter shade for readability
            'text-blue-500': 'bg-[#D1E8F2]',
            'text-green-500': 'bg-[#CDEBBC]',
            'text-yellow-500': 'bg-[#CDD4F8]',
            'text-purple-500': 'bg-[#F6DBF6]',
            'text-pink-500': 'bg-[#FFF2E5]',
        };
        return colorMap[colorClass] || 'bg-gray-100';
    };

    return (
        <div className="w-full pb-8 pt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-left mb-6">  <span style={{color:theme.colors.brand[7]}} >OUR</span> FEATURES</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {information.map((feature, index) => (
                    <div
                        key={index}
                        className="border rounded-sm p-4 flex flex-col items-center hover:-translate-y-1 hover:shadow-sm transition-transform duration-200 ease-in-out"
                    >
                        <Image
                            src={feature.image}
                            alt={feature.title}
                            width={104}
                            height={104}
                            className="w-26 h-26 object-cover"
                        />
                        <h3
                            className={`text-sm sm:text-base md:text-lg font-semibold px-3 py-1 rounded-sm mt-4 ${getBackgroundClass(feature.color)} ${feature.color}`}
                            style={{ color: theme.colors.brand?.[5] || '#1E40AF' }}
                        >
                            {feature.title}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;