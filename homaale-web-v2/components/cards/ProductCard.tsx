// components/ui/Card.tsx
import React from 'react';

interface CardProps {
    image: string;
    title: string;
    rating: number;
    reviews: number;
    price?: number;
    onAddToBox: () => void;
}

export const ProductCard: React.FC<CardProps> = ({
                                              image,
                                              title,
                                              rating,
                                              reviews,
                                              price,
                                              onAddToBox,
                                          }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 max-w-sm">
            {/* Card Header: Image */}
            <div className="h-48">
    <img
        src={image||"https://images.unsplash.com/photo-1529693662653-9d480530a697?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHlvZ2ElMjBjZW50ZXJ8ZW58MHx8MHx8fDA%3D"}
    alt={title}
    className="w-full h-full object-cover"
        />
        </div>

    {/* Card Content */}
    <div className="p-4">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
    <div className="flex items-center">
    <span className="text-yellow-400">★</span>
    <span className="ml-1">{rating}</span>
        <span className="ml-1">({reviews})</span>
        </div>
        <div className="font-bold">Rs {price}</div>
    </div>
    <button
    onClick={onAddToBox}
    className="w-full py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-100 transition"
        >
        Add to Box
    </button>
    </div>
    </div>
);
};
