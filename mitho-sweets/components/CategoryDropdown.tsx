import Link from "next/link";
import { BiCategory } from "react-icons/bi";
import { FaAngleRight } from "react-icons/fa";
import { Category, useCategories } from "@/lib/hooks/useCategory";
import React, { useState, useRef, useEffect } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import {useRouter} from "next/navigation";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  className?: string;
}

interface CategoryDropdownProps {
  forDrawer?: boolean;
  forBlog?: boolean;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ forDrawer = false, forBlog = false }) => {
  const { categories, isLoading } = useCategories() as UseCategoriesReturn;
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleMouseEnter = (categoryId: number) => {
    if (forDrawer) return;
    if (forBlog) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    if (forDrawer) return;
    if (forBlog) return;
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  useEffect(() => {
    if (forDrawer || forBlog) return;
    const handleScroll = () => {
      setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const clearFilter = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
    router.push("/blog")
  };

  useEffect(() => {
    if (forBlog) {
      setIsOpen(true);
    }
  }, [forBlog]);


  const handleSubcategoryClick = (subcategoryName: string) => {
    setActiveSubcategory(activeSubcategory === subcategoryName ? null : subcategoryName);
  };
  const displayedCategories = showAll ? categories : categories.slice(0, 10);

  useEffect(() => {
    if (forDrawer) return;
    if (forBlog) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (forDrawer) {
    // Drawer mode: Button toggles a flat list of categories and subcategories
    return (
      <div className="space-y-2">
        <button
          className="flex items-center gap-2 cursor-pointer text-xl font-medium hover:text-red-500 transition-colors duration-200 w-full text-left"
          onClick={toggleDropdown}
          aria-label="Browse Categories"
          aria-expanded={isOpen}
        >
          <BiCategory className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          <span>Browse Categories</span>
        </button>

        {isOpen && (
          <div className="space-y-1 pl-4">
            {isLoading ? (
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                      <MithoSweetsLoader/>
                    </div>
            ) : categories.length === 0 ? (
              <div className="text-center text-gray-500 py-4 animate-fade-in">No categories available</div>
            ) : (
              <div className="space-y-1">
                {displayedCategories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <Link
                      href={`/shop?category=${category.slug}&id=${category.id}`}
                      className="flex items-center gap-2 p-2 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                      onClick={toggleDropdown}
                    >
                      <div
                          className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                          dangerouslySetInnerHTML={{__html: category.icon || "🛒"}}
                      />

                      <span>{category.name}</span>
                    </Link>
                    {category.sub_category.length > 0 && (
                        <ul className="pl-6 space-y-1">
                        {category.sub_category.map((sub: Category, subIndex: number) => (
                          <li key={subIndex} className="animate-fade-in" style={{ animationDelay: `${subIndex * 30}ms` }}>
                            <Link
                              href={`/shop?category=${category.slug}&id=${category.id}&subcategory=${sub.slug}`}
                              className="block p-1 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                              onClick={toggleDropdown}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {categories.length > 9 && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={toggleShowAll}
                      className="w-full flex items-center justify-between text-sm px-3 py-2 rounded hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                      <span>{showAll ? 'Show less...' : 'Show more...'}</span>
                      <div className={`ml-2 transition-transform duration-300 ease-in-out ${showAll ? 'rotate-180' : 'rotate-0'}`}>
                        {showAll ? <FiMinus /> : <FiPlus />}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <style jsx>{`
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
}
to {
    opacity: 1;
    transform: translateY(0);
}
}
.animate-fade-in {
animation: fade-in 0.3s ease-out forwards;
}
`}</style>
</div>
    );
  }

  if (forBlog) {
    return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
                className={`flex items-center mb-4 gap-2 cursor-pointer hover:text-red-500 transition-colors duration-200 w-full text-left 
                ${forBlog ? 'text-2xl font-semibold py-3' : 'text-xl font-medium py-2'}`}
                onClick={toggleDropdown}
                aria-label="Browse Categories"
                aria-expanded={isOpen}
            >

              <BiCategory className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}/>
              <span>Browse Categories</span>
            </button>
            {(activeCategory || activeSubcategory) && (
                <button
                    onClick={clearFilter}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors duration-200"
                    aria-label="Clear filter"
                >
                  <IoClose className="w-5 h-5" />
                  <span>Clear</span>
                </button>
            )}
          </div>
          {isOpen && (
              <div className="space-y-1 pl-4 max-h-[300px] overflow-y-auto">
                {isLoading ? (
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                      <MithoSweetsLoader/>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 animate-fade-in">No categories available</div>
                ) : (
                    <div className="space-y-1">
                      {categories.map((category) => (
                          <div key={category.id} className="space-y-1">
                            <Link
                                href={`/blog?category=${category.slug}&id=${category.id}`}
                                className={`flex items-center gap-2 p-2 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 ${
                                    activeCategory === category.id ? 'bg-red-100 text-red-600 font-semibold' : ''
                                }`}
                                onClick={() => handleCategoryClick(category.id)}
                            >
                              <div
                                  className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                                  dangerouslySetInnerHTML={{__html: category.icon || "🛒"}}
                              />

                              <span>{category.name}</span>
                              {category.sub_category.length > 0 && (
                                  <FaAngleRight
                                      className={`ml-auto transition-transform duration-200 ${
                                          activeCategory === category.id ? 'rotate-90' : 'rotate-0'
                                      }`}

                                  />
                              )}
                            </Link>

                            {category.sub_category.length > 0 && activeCategory === category.id && (
                                <ul className="pl-6 space-y-1">
                                  {category.sub_category.map((sub: Category, subIndex: number) => (
                                      <li key={subIndex} className="animate-fade-in"
                                          style={{animationDelay: `${subIndex * 30}ms`}}>
                                        <Link
                                            href={`/blog?category=${category.slug}&id=${category.id}&subcategory=${sub.slug}`}
                                            className={`block p-1 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 ${
                                                activeSubcategory === sub.name ? 'bg-red-100 text-red-600 font-semibold' : ''
                                            }`}
                                            onClick={() => handleSubcategoryClick(sub.name)}
                                        >
                                          {sub.name}
                                        </Link>
                                      </li>
                                  ))}
                                </ul>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
          )}
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }

            .space-y-1::-webkit-scrollbar {
              width: 8px;
            }

            .space-y-1::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }
            .space-y-1::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 4px;
            }
            .space-y-1::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
        </div>
    );
  }

  // Modal mode: Existing dropdown behavior for third-section
  return (
    <div className="relative"

    >
      <button
        className="flex items-center gap-2 cursor-pointer text-xl font-medium hover:text-red-500 transition-colors duration-200"
        onClick={toggleDropdown}
        aria-label="Browse Categories"
        aria-expanded={isOpen}
      >
        <BiCategory className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        <span>Browse Categories</span>
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="absolute top-full left-0 mt-5 mb-20 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-20">
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 py-4 animate-fade-in">No categories available</div>
          ) : (
            <div className="space-y-1">
              {displayedCategories.map((category) => (
                <div
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="flex items-center justify-between p-2 hover:bg-red-50 rounded text-gray-700 hover:text-red-500 transition-all duration-200 ease-in-out cursor-pointer transform hover:translate-x-1"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <Link
                        href={`/shop?category=${category.slug}&id=${category.id}`}
                        className="flex items-center gap-2"
                        onClick={toggleDropdown}
                    >
                      <div
                          className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                          dangerouslySetInnerHTML={{__html: category.icon || "🛒"}}
                      />

                      <span>{category.name}</span>
                    </Link>
                    {category.sub_category.length > 0 && (
                        <FaAngleRight
                            className={`text-gray-400 group-hover:text-red-500 transition-all duration-200 transform ${
    activeCategory === category.id ? 'rotate-90 scale-110' : 'rotate-0'
}`}
                      />
                    )}
                  </div>

                  {category.sub_category.length > 0 && (
                    <div
                      className={`absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-3 z-30 transition-all duration-300 ease-in-out transform ${
    activeCategory === category.id
        ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
        : 'opacity-0 scale-95 -translate-x-2 pointer-events-none'
}`}
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <h3 className="font-semibold text-gray-800 mb-2 animate-fade-in">{category.name}</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {category.sub_category.map((sub: Category, subIndex: number) => (
                          <li key={subIndex} className="animate-fade-in" style={{ animationDelay: `${subIndex * 30}ms` }}>
                            <Link
                              href={`/shop?category=${category.slug}&id=${category.id}&subcategory=${sub.slug}`}
                              className="block p-1 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-105"
                              onClick={toggleDropdown}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {categories.length > 9 && (
                <div className="pt-2 border-t border-gray-100 mt-3">
                  <button
                    onClick={toggleShowAll}
                    className="w-full flex items-center justify-between text-sm px-3 py-2 rounded focus:outline-none hover:text-red-500 hover:bg-red-50 transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    <span className="transition-colors duration-200">{showAll ? 'Show less...' : 'Show more...'}</span>
                    <div className={`ml-2 transition-transform duration-300 ease-in-out ${showAll ? 'rotate-180' : 'rotate-0'}`}>
                      {showAll ? <FiMinus /> : <FiPlus />}
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
}
to {
    opacity: 1;
    transform: translateY(0);
}
}
.animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
}
    `}</style>
    </div>
  );
};

export default CategoryDropdown;