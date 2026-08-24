import React, { FC } from 'react';
import Link from 'next/link';
import NoDataPage from "@/components/Error/NoDataPage";

// Define the interface for a category
export interface Category {
    id: number;
    name?: string;
    post_count?: number;
}
interface CategoriesProps {
    categories: Category[];
    onCategoryClick: (categoryId: number) => void;
    selectedCategory: any;
}


// Categories component
const Categories : FC<CategoriesProps> = ({ categories, onCategoryClick , selectedCategory }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
                {categories.length > 0 ? categories?.map((category) => (
                    <li key={category.id}>
                        <button
                            onClick={() => onCategoryClick(category.id)}
                            className={`group flex items-center justify-between text-gray-600 transition-colors ${
                                selectedCategory === category.id ? "text-red-500" : ""
                            }`}
                        >
                            <span className="group-hover:text-red-400 transition-colors">{category.name}</span>
                            <span className="text-sm group-hover:text-red-400 transition-colors">
                                ({category.post_count || 0})
                            </span>
                        </button>
                    </li>

                )): (
                    <div className="text-red-400">
                    No Categories Found
                    </div>
                    )}
            </ul>
        </div>
    );
};

export default Categories;