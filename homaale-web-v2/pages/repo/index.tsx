"use client";

import {
  Button,
  Input,
  RangeSlider,
  Select,
  Pagination,
  MultiSelect
} from "@mantine/core";
import {
  Baby,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Share2,
  Shirt,
  ShoppingBag,
  Star,
  User,
  Users,
  X,
  Menu,
  Filter
} from 'lucide-react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useClickOutside, useMediaQuery } from '@mantine/hooks';

const sampleImages = {
  waiter: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937',
  webDesign: 'https://images.unsplash.com/photo-1547658719-da2b51169166',
  nurse: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c',
  trainer: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
  vet: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
  chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
};

const sampleData: ServiceTask[] = [
  {
    id: 1,
    title: "Need A Waiter",
    type: "TASK",
    price: 824800,
    priceType: "per Monthly",
    location: "Lalitpur",
    date: "Nov 29, 2023",
    time: "10:00 AM- 6:00 PM",
    appliedCount: 0,
    image: sampleImages.waiter,
    postedBy: {
      name: "utsav gungagain",
      avatar: "/avatars/utsav.jpg"
    },
    postedAt: "30 days ago",
    rating: 0
  },
  {
    id: 2,
    title: "Entertainment And Media",
    type: "SERVICE",
    price: 6189,
    priceType: "per Project",
    location: "Kathmandu",
    bookedCount: 0,
    image: sampleImages.entertainment,
    postedBy: {
      name: "nirman subedi",
      avatar: "/avatars/nirman.jpg"
    },
    postedAt: "1 month ago",
    rating: 0
  },
  {
    id: 3,
    title: "Need A Cleaner For Office",
    type: "SERVICE",
    price: 2425,
    priceType: "per Project",
    location: "Kathmandu",
    bookedCount: 1,
    image: sampleImages.cleaning,
    postedBy: {
      name: "Nichan Subedi",
      avatar: "/avatars/nichan.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  },
  {
    id: 4,
    title: "Web Designer",
    type: "TASK",
    price: 16158,
    priceType: "per Monthly",
    location: "Kathmandu",
    date: "Oct 1, 2027",
    time: "8:00 AM- 5:00 PM",
    appliedCount: 1,
    image: sampleImages.webDesign,
    postedBy: {
      name: "nirman subedi",
      avatar: "/avatars/nirman.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  },
  {
    id: 5,
    title: "Need A Nurse For",
    type: "TASK",
    price: 235,
    priceType: "per Project",
    location: "Kathmandu",
    date: "Mar 28, 2028",
    time: "10:00 AM- 6:00 AM",
    appliedCount: 1,
    image: sampleImages.nurse,
    postedBy: {
      name: "Nichan Subedi",
      avatar: "/avatars/nichan.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  },
  {
    id: 6,
    title: "Need A Trainer",
    type: "TASK",
    price: 2062,
    priceType: "per Monthly",
    location: "Kathmandu",
    date: "Feb 13, 2025",
    time: "5:45 AM- 7:15 AM",
    appliedCount: 0,
    image: sampleImages.trainer,
    postedBy: {
      name: "Nichan Subedi",
      avatar: "/avatars/nichan.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  },
  {
    id: 7,
    title: "In Need For Veterinary",
    type: "TASK",
    price: 8248,
    priceType: "per Monthly",
    location: "Kathmandu",
    date: "Oct 1, 2030",
    time: "7:00 AM- 5:00 PM",
    appliedCount: 0,
    image: sampleImages.vet,
    postedBy: {
      name: "nirman subedi",
      avatar: "/avatars/nirman.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  },
  {
    id: 8,
    title: "REQUIRE A QUALIFIED",
    type: "SERVICE",
    price: 50027,
    priceType: "per Project",
    location: "Kathmandu",
    bookedCount: 0,
    image: sampleImages.chef,
    postedBy: {
      name: "utsav gungagain",
      avatar: "/avatars/utsav.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  },
  {
    id: 9,
    title: "Need A Lead-Chef In My",
    type: "TASK",
    price: 9898,
    priceType: "per Project",
    location: "Kathmandu",
    date: "Oct 1, 2030",
    appliedCount: 1,
    bookedCount: 0,
    image: sampleImages.chef,
    postedBy: {
      name: "nirman subedi",
      avatar: "/avatars/nirman.jpg"
    },
    postedAt: "2 months ago",
    rating: 0
  }
];

interface ServiceTask {
  id: number;
  title: string;
  type: 'SERVICE' | 'TASK';
  price: number;
  priceType: 'per Monthly' | 'per Project';
  location: string;
  date?: string;
  time?: string;
  appliedCount?: number;
  bookedCount?: number;
  image?: string;
  postedBy: {
    name: string;
    avatar: string;
  };
  postedAt: string;
  rating: number;
}

const CategoryIcon = ({ category, isExpanded }: { category: string; isExpanded: boolean }) => {
  const iconClass = `w-4 h-4 ${isExpanded ? 'text-blue-600' : 'text-gray-500'}`;

  switch (category) {
    case "Women's Collection":
      return (
        <div className={`${isExpanded ? 'bg-blue-50' : 'bg-gray-50'} p-1.5 rounded`}>
          <User className={iconClass} />
        </div>
      );
    case "Kids & Baby":
      return (
        <div className={`${isExpanded ? 'bg-blue-50' : 'bg-gray-50'} p-1.5 rounded`}>
          <Baby className={iconClass} />
        </div>
      );
    default:
      return (
        <div className={`${isExpanded ? 'bg-blue-50' : 'bg-gray-50'} p-1.5 rounded`}>
          <Shirt className={iconClass} />
        </div>
      );
  }
};

const ServiceTaskCard = ({ item, isGridView }: { item: ServiceTask, isGridView: boolean }) => (
  <div className={`
    group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
    hover:shadow-md hover:border-gray-300 transition-all duration-200
    ${isGridView
      ? 'flex flex-col h-full'
      : 'flex flex-row h-auto sm:h-[180px]'
    }
  `}>
    {/* Card Image */}
    <div className={`
      overflow-hidden flex-shrink-0 relative
      ${isGridView
        ? 'aspect-[16/9] w-full'
        : 'w-[140px] sm:w-[200px] h-full'
      }
    `}>
      <img
        src={item.image || '/default-image.jpg'}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Price Badge */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1
        rounded-full shadow-sm border border-gray-100">
        <span className="text-sm font-semibold text-gray-900">
          ₹{item.price.toLocaleString()}
        </span>
      </div>
    </div>

    {/* Content Container */}
    <div className={`
      flex flex-col flex-grow relative min-w-0
      ${isGridView
        ? 'p-4'
        : 'p-4 sm:p-5'
      }
    `}>
      {/* Main Content Area */}
      <div className="flex-grow space-y-3 min-w-0">
        {/* Status and Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`
            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
            ${item.type === 'TASK'
              ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/20'
              : 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/20'}
          `}>
            <span className={`w-1 h-1 rounded-full ${
              item.type === 'TASK' ? 'bg-blue-500' : 'bg-orange-500'
            }`} />
            {item.type}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {item.priceType}
          </span>
        </div>

        {/* Title */}
        <h3 className={`
          font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors
          ${isGridView ? 'text-base' : 'text-lg'}
        `}>
          {item.title}
        </h3>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{item.location}</span>
          </div>
          {item.type === 'TASK' && item.date && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">
                {item.date}
                {item.time && <span className="hidden sm:inline ml-1">{item.time}</span>}
              </span>
            </div>
          )}
        </div>

        {/* User Info and Stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={item.postedBy.avatar}
                alt={item.postedBy.name}
                className="w-8 h-8 rounded-full ring-2 ring-white"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                bg-green-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 hover:text-blue-600
                cursor-pointer truncate max-w-[150px]">
                {item.postedBy.name}
              </span>
              <span className="text-xs text-gray-500">{item.postedAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className={`w-4 h-4 ${
                item.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`} />
              <span className="text-sm font-medium">{item.rating || 'New'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {item.type === 'TASK'
                  ? `${item.appliedCount} Applied`
                  : `${item.bookedCount} Booked`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600
          transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-gray-700 hover:text-blue-600
            transition-colors">
            Save
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600
            rounded-full hover:bg-blue-700 transition-colors">
            {item.type === 'TASK' ? 'Apply Now' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ProductDashboard = () => {
  const initialCategories = [
    {
      id: 1,
      name: "Hospitality Services",
      subCategories: [
        {
          id: 11,
          name: 'Restaurant Staff',
          items: 2,
          services: [
            sampleData.find(item => item.title === "Need A Waiter"),
            sampleData.find(item => item.title === "Need A Lead-Chef In My")
          ]
        },
        {
          id: 12,
          name: 'Entertainment',
          items: 1,
          services: [
            sampleData.find(item => item.title === "Entertainment And Media")
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Professional Services",
      subCategories: [
        {
          id: 21,
          name: 'Healthcare',
          items: 1,
          services: [
            sampleData.find(item => item.title === "Need A Nurse For")
          ]
        },
        {
          id: 22,
          name: 'Cleaning',
          items: 1,
          services: [
            sampleData.find(item => item.title === "Need A Cleaner For Office")
          ]
        },
        {
          id: 23,
          name: 'IT Services',
          items: 1,
          services: [
            sampleData.find(item => item.title === "Web Designer")
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Training & Education",
      subCategories: [
        {
          id: 31,
          name: 'Fitness Training',
          items: 1,
          services: [
            sampleData.find(item => item.title === "Need A Trainer")
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Pet Services",
      subCategories: [
        {
          id: 41,
          name: 'Veterinary Services',
          items: 1,
          services: [
            sampleData.find(item => item.title === "In Need For Veterinary")
          ]
        }
      ]
    }
  ];

  const [categories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'services' | 'tasks' | 'both'>('both');
  const [items] = useState(sampleData);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMyList, setShowMyList] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const itemsPerPage = 6;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Refs for click outside handling
  const sidebarRef = useClickOutside(() => setIsSidebarOpen(false));
  const filterRef = useClickOutside(() => {
    if (window.innerWidth < 1280 && isFilterVisible) {
      // Only close if we're clicking outside the filter area
      const filterElement = filterRef.current;
      const clickTarget = event?.target as Node;

      if (filterElement && !filterElement.contains(clickTarget)) {
        // Check if the click target is a Mantine dropdown or popover
        const isDropdownClick = (clickTarget as Element).closest('[role="dialog"]') ||
                              (clickTarget as Element).closest('[role="listbox"]') ||
                              (clickTarget as Element).closest('.mantine-Select-dropdown') ||
                              (clickTarget as Element).closest('.mantine-MultiSelect-dropdown');

        if (!isDropdownClick) {
          setIsFilterVisible(false);
        }
      }
    }
  });

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const clearFilters = () => {
    setPriceRange([0, 1000000]);
    setSortBy(null);
    setServiceType(null);
    setSelectedCity(null);
    setSelectedCategories([]);
    setSearchTerm('');
  };

  const filteredProducts = useMemo(() => {
    let filtered = items;

    // Filter by active subcategory
    if (activeCategory) {
      const selectedSubCategory = categories
        .flatMap(cat => cat.subCategories)
        .find(sub => sub.id === activeCategory);

      if (selectedSubCategory) {
        filtered = selectedSubCategory.services.filter(Boolean) as ServiceTask[];
      }
    }

    // Apply other filters
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Service type filter
    if (serviceType) {
      filtered = filtered.filter(item => item.type === serviceType);
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(item => item.location === selectedCity);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item =>
        selectedCategories.some(cat => item.type === cat)
      );
    }

    // Sort
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'date-newest':
            return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
          case 'date-oldest':
            return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [items, activeCategory, searchTerm, priceRange, serviceType, selectedCity, selectedCategories, sortBy, categories]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return 'All Services & Tasks';
    const subCategory = categories
      .flatMap(cat => cat.subCategories)
      .find(sub => sub.id === activeCategory);
    return subCategory?.name || 'All Services & Tasks';
  }, [activeCategory, categories]);

  const FilterContent = () => (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <RangeSlider
          value={priceRange}
          onChange={setPriceRange}
          min={0}
          max={1000000}
          step={1000}
          label={(value) => `₹${value.toLocaleString()}`}
          className="px-2"
        />
      </div>

      {/* Service Type */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Service Type</h3>
        <Select
          value={serviceType}
          onChange={setServiceType}
          data={[
            { value: 'SERVICE', label: 'Service' },
            { value: 'TASK', label: 'Task' }
          ]}
          placeholder="Select type"
          clearable
        />
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
        <Select
          value={selectedCity}
          onChange={setSelectedCity}
          data={[
            { value: 'Kathmandu', label: 'Kathmandu' },
            { value: 'Lalitpur', label: 'Lalitpur' },
            { value: 'Bhaktapur', label: 'Bhaktapur' }
          ]}
          placeholder="Select city"
          clearable
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
        <MultiSelect
          value={selectedCategories}
          onChange={setSelectedCategories}
          data={categories.map(cat => ({
            value: cat.name,
            label: cat.name
          }))}
          placeholder="Select categories"
          clearable
        />
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
        <Select
          value={sortBy}
          onChange={setSortBy}
          data={[
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
            { value: 'date-newest', label: 'Date: Newest First' },
            { value: 'date-oldest', label: 'Date: Oldest First' }
          ]}
          placeholder="Select sorting"
          clearable
        />
      </div>

      {/* Clear Filters Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="light"
          color="red"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            clearFilters();
          }}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  const isXlScreen = useMediaQuery('(min-width: 1280px)');
  const shouldShowFilterButton = useCallback(() => {
    return !isXlScreen;
  }, [isXlScreen]);

  const filterClassNames = `
    fixed md:sticky top-0 right-0
    h-full w-[280px] md:w-[240px] lg:w-[280px]
    bg-white border-l border-gray-200
    shadow-lg md:shadow-none
    transform transition-all overflow-hidden
    z-50
    ${isFilterVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
    ${isXlScreen ? 'xl:translate-x-0' : ''}
  `;

  // Add useEffect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsFilterVisible(true);
      } else {
        setIsFilterVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFilterVisible(true);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 md:hidden bg-white border-b border-gray-200 h-14">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="flex-1 text-base font-semibold text-center truncate mx-4">
            {activeCategoryName}
          </h1>

          <div className="flex items-center gap-2">
            {/* Grid/List Toggle for Mobile */}
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
            >
              {isGridView ? (
                <List className="h-5 w-5" />
              ) : (
                <LayoutGrid className="h-5 w-5" />
              )}
            </button>

            {/* Filter Button - Show only on screens > 320px */}
            <div className="hidden min-[321px]:block">
              <button
                onClick={handleFilterClick}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main flex container - Adjusted height to account for mobile header */}
      <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">
        {/* Left Sidebar - Fixed */}
        <aside ref={sidebarRef} className={`
          fixed md:sticky top-0 left-0 z-50
          h-full w-[280px] md:w-[240px] lg:w-[280px] bg-white
          border-r border-gray-200 shadow-lg md:shadow-none
          transform transition-all overflow-hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-full overflow-hidden flex flex-col">
            {/* Sidebar Header */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sidebar Content - Scrollable */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="px-2">
                {/* Search box */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="sm"
                      className="bg-white border border-gray-200 pl-9"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="px-2">
                  {/* Categories Header with Clear Button */}
                  <div className="flex items-center justify-between px-2 py-3">
                    <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                    {activeCategory !== null && (
                      <button
                        onClick={() => setActiveCategory(null)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Clear category selection"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>

                  {/* Categories List */}
                  {categories.map(category => (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={`
                          w-full flex items-center px-2 py-2 rounded-md cursor-pointer
                          hover:bg-gray-50
                        `}
                      >
                        <div className="flex items-center flex-1">
                          <CategoryIcon
                            category={category.name}
                            isExpanded={expandedCategories[category.id]}
                          />
                          <span className="ml-2 text-sm text-gray-900">{category.name}</span>
                          <span className={`
                            ml-1 text-xs px-2 py-0.5 rounded bg-gray-100
                            ${expandedCategories[category.id] ? 'text-gray-900' : 'text-gray-500'}
                          `}>
                            {category.subCategories.reduce((acc, sub) => acc + sub.items, 0)}
                          </span>
                        </div>
                        {expandedCategories[category.id] ?
                          <ChevronDown className={`w-4 h-4 ${expandedCategories[category.id] ? 'text-blue-600' : 'text-gray-400'}`} /> :
                          <ChevronRight className={`w-4 h-4 ${expandedCategories[category.id] ? 'text-blue-600' : 'text-gray-400'}`} />
                        }
                      </button>

                      {/* Subcategories */}
                      {expandedCategories[category.id] && (
                        <div className="ml-8 mt-1">
                          {category.subCategories.map(subCategory => (
                            <button
                              key={subCategory.id}
                              onClick={() => setActiveCategory(subCategory.id)}
                              className={`
                                w-full flex items-center justify-between py-2 px-2 rounded-md cursor-pointer
                                ${activeCategory === subCategory.id ? 'bg-gray-100' : 'hover:bg-gray-50'}
                              `}
                            >
                              <span className={`text-sm ${activeCategory === subCategory.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                {subCategory.name}
                              </span>
                              <span className={`
                                text-xs px-2 py-0.5 rounded
                                ${activeCategory === subCategory.id
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-500'}
                              `}>
                                {subCategory.items}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Content - Scrollable */}
        <main className="flex-1 w-0 relative overflow-hidden">
          <div className="h-full flex flex-col max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
            {/* Header - Sticky */}
            <div className="hidden md:block sticky top-0 bg-gray-50/95 backdrop-blur-sm py-3 z-10 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-lg md:text-xl lg:text-2xl font-semibold truncate">
                  {activeCategoryName}
                </h1>
                <div className="flex items-center gap-3">
                  <Button
                    variant={showMyList ? "filled" : "light"}
                    size="sm"
                    onClick={() => setShowMyList(!showMyList)}
                  >
                    My List
                  </Button>
                  <Button
                    variant={showBookmarks ? "filled" : "light"}
                    size="sm"
                    onClick={() => setShowBookmarks(!showBookmarks)}
                  >
                    Bookmarks
                  </Button>
                  {shouldShowFilterButton() && (
                    <button
                      onClick={handleFilterClick}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Show filters"
                    >
                      <Filter className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsGridView(!isGridView)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
                  >
                    {isGridView ? (
                      <List className="h-5 w-5" />
                    ) : (
                      <LayoutGrid className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {/* Grid/List Container */}
              <div className={`
                ${isGridView
                  ? 'grid gap-3 sm:gap-4 md:gap-6' +
                    ' grid-cols-1' +
                    ' sm:grid-cols-2' +
                    ' md:grid-cols-2' +
                    ' lg:grid-cols-2' +
                    ' xl:grid-cols-3' +
                    ' 2xl:grid-cols-4'
                  : 'flex flex-col gap-3 sm:gap-4'
                }
                auto-rows-fr
              `}>
                {paginatedProducts.map(item => (
                  <ServiceTaskCard key={item.id} item={item} isGridView={isGridView} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 md:mt-8 flex justify-center py-4">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                  radius="md"
                  withEdges
                  className="shadow-sm"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Fixed */}
        <aside ref={filterRef} className={filterClassNames}>
          <div className="h-full overflow-hidden flex flex-col">
            {/* Filter Header */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setIsFilterVisible(false)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="p-4">
                <FilterContent />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Overlay for filter sidebar on mobile/tablet */}
      {isFilterVisible && window.innerWidth < 1280 && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFilterVisible(false)}
        />
      )}
    </div>
  );
};

export default ProductDashboard;
