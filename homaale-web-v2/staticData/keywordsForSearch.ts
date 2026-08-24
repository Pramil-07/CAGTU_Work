export const PAGE_INDEX = [
    { path: "/about-us", keywords: ["about", "company", "info"], title: "About Us", description: "Learn more about our company, mission, and values." },
    { path: "/blogs", keywords: ["blog", "articles", "news"], title: "Blogs", description: "Read the latest blogs, articles, and news updates." },
    { path: "/bookings", keywords: ["bookings", "reservations", "schedule"], title: "Bookings", description: "View and manage your current bookings." },
    { path: "/calculator", keywords: ["calculator", "math", "tools"], title: "Calculator", description: "Perform calculations quickly and easily." },
    { path: "/calendar", keywords: ["calendar", "events", "schedule"], title: "Calendar", description: "Organize and track your events and schedules." },
    { path: "/career", keywords: ["career", "jobs", "employment"], title: "Career", description: "Find exciting career opportunities and job openings." },
    { path: "/tax-calculator", keywords: ["tax", "calculator", "finance"], title: "Tax Calculator", description: "Calculate your taxes accurately with our tool.", },
    { path: "/category", keywords: ["category", "filter", "group"], title: "Category", description: "Browse items and content by category." },
    { path: "/chat", keywords: ["chat", "message", "talk"], title: "Chat", description: "Communicate and chat with others instantly." },
    { path: "/box", keywords: ["checkout", "payment", "cart"], title: "Checkout", description: "Review and confirm your purchases." },
    { path: "/clients", keywords: ["clients", "customers", "users"], title: "Clients", description: "Manage client and customer information." },
    { path: "/contact-us", keywords: ["contact", "support", "help"], title: "Contact Us", description: "Get in touch with our team for assistance." },
    { path: "/hotels/search",keywords: ["hotels", "stay", "accommodation", "booking", "rooms", "motel"], title: "Stays", description: "Find and book the best hotels for your stay with top-rated amenities and comfort."},
    { path: "/data-deletion-policy", keywords: ["data", "policy", "privacy"], title: "Data Deletion Policy", description: "Read about how we handle data deletion requests." },
    { path: "/explore", keywords: ["explore", "discover", "browser"], title: "Explore", description: "Explore content, products, and new ideas." },
    { path: "/FAQs", keywords: ["faq", "questions", "help"], title: "FAQs", description: "Find answers to frequently asked questions." },
    { path: "/feedback", keywords: ["feedback", "reviews", "suggestions"], title: "Feedback", description: "Share your thoughts and suggestions with us." },
    { path: "/horoscope", keywords: ["horoscope", "astrology", "zodiac"], title: "Horoscope", description: "Check your horoscope and astrology predictions." , key:"horoscopeSearch" },
    { path: "/explore?type=task", keywords: ["tasks", "help", "need","todo", "work", "hire", "job" ,"assignments"], title: "Task", description: "View and manage your tasks efficiently." },
    { path: "/explore?type=services", keywords: ["services", "repair", "support", "cleaning", "fix", "maintenance", "offering"], title: "Services", description: "Learn about the services we provide." },
    { path: "/stay", keywords: ["stay", "accommodation", "lodging"], title: "Stay", description: "Find places to stay comfortably during your travels." },
    { path: "/tasker", keywords: ["tasker", "worker", "freelancer"], title: "Tasker", description: "Connect with skilled taskers to get work done." },
    { path: "/merchants", keywords: ["merchants", "vendors", "seller", "vendor", "partners"], title: "Merchants", description: "View and manage all merchants on the platform." },
    { path: "/myList", keywords: ["mylist", "favorites", "wishlist"], title: "My List", description: "Keep track of your favorite items and saved lists." },
    { path: "/overview", keywords: ["overview", "summary", "dashboard"], title: "Overview", description: "Get an overview of your account and activities." },
    { path: "/payment/history", keywords: ["payment", "billings", "transactions", "history"], title: "Transaction History", description: "Handle your payments and billing details." },
    { path: "/payment/earnings", keywords: ["earnings", "income", "salary", "revenue", "profit", "my"], title: "My Earnings", description: "View and manage your earnings and income details."},
    { path: "/payment/withdraw", keywords: ["withdraws", "funds", "money", "payout", "transfer"], title: "Withdraw Funds", description: "Request and manage your fund withdrawals securely." },
    { path: "/products", keywords: ["product", "products", "buy", "shop", "item", "sell", "item", "goods"], title: "Products", description: "Browse available products in our store." },
    { path: "/redeem", keywords: ["redeem", "voucher", "coupon"], title: "Redeem", description: "Redeem your coupons, vouchers, or reward points." },
    { path: "/repo", keywords: ["repo", "repository", "source"], title: "Repository", description: "View and manage source code or repositories." },
    { path: "/settings", keywords: ["settings", "preferences", "account"], title: "Settings", description: "Update your account and application settings." },
    { path: "/shops", keywords: ["shop", "store", "market"], title: "Shops", description: "Find and shop from different stores." },
    { path: "/staff", keywords: ["staff", "team", "employees"], title: "Staff", description: "Manage staff profiles and team members." },
    { path: "/support", keywords: ["support", "help", "assist"], title: "Support", description: "Access support and help documentation." }
];

export interface CategoryItem {
    id: string
    name: string
    slug: string
    description: string
    mainDescription: string
    subcategories: {
        id: string
        name: string
        description: string
    }[]
}

export const CATEGORIES_INDEX: CategoryItem[] = [
    {
        id: "hotels",
        name: "Hotels",
        slug: "hotels",
        description: "Find and book hotels worldwide",
        mainDescription:
            "Fully Refundable Options — Search Hotels. Find & Compare Deals and You Can Save Big! Trips Made Easier and More...",
        subcategories: [
            {
                id: "luxury-hotels",
                name: "Luxury Hotels",
                description:
                    "Experience premium accommodations with world-class amenities and exceptional service for discerning travelers.",
            },
            {
                id: "budget-hotels",
                name: "Budget Hotels",
                description:
                    "Find affordable accommodations without compromising on comfort and essential amenities for budget-conscious travelers.",
            },
            {
                id: "last-minute-deals",
                name: "Last Minute Deals",
                description: "Get exclusive discounts on last-minute hotel bookings and travel deals that save you money.",
            },
            {
                id: "hotels-near-me",
                name: "Hotels Near Me",
                description: "Browse hotels available in your location and read verified guest reviews before booking.",
            },
            {
                id: "quick-booking",
                name: "Quick Booking Confirmation",
                description: "Instant confirmation on hotel reservations and vacation packages with easy checkout.",
            },
            {
                id: "pet-friendly",
                name: "Pet-Friendly Hotels",
                description: "Travel with your pets comfortably. View popular pet-friendly hotels across the world.",
            },
        ],
    },
    {
        id: "services",
        name: "Services",
        slug: "services",
        description: "Professional services and repairs",
        mainDescription:
            "Quality Services from Trusted Professionals. Get repairs, cleaning, maintenance, and more done efficiently.",
        subcategories: [
            {
                id: "home-repair",
                name: "Home Repair",
                description: "Professional home repair services for plumbing, electrical, carpentry, and general maintenance.",
            },
            {
                id: "cleaning",
                name: "Cleaning Services",
                description: "Professional cleaning services for homes and offices including deep cleaning.",
            },
            {
                id: "handyman",
                name: "Handyman Services",
                description: "Skilled handymen for various home improvement and repair tasks.",
            },
            {
                id: "plumbing",
                name: "Plumbing Services",
                description: "Expert plumbing solutions for installations, repairs, and emergency needs.",
            },
            {
                id: "electrical",
                name: "Electrical Services",
                description: "Licensed electricians for installations and maintenance of electrical systems.",
            },
        ],
    },
    {
        id: "products",
        name: "Products",
        slug: "products",
        description: "Shop quality products online",
        mainDescription: "Buy Quality Products. Find & Compare Great Deals. Save on Your Purchases Today.",
        subcategories: [
            {
                id: "electronics",
                name: "Electronics",
                description: "Latest gadgets, phones, laptops, and tech accessories from trusted brands.",
            },
            {
                id: "home-garden",
                name: "Home & Garden",
                description: "Furniture, decor, and gardening products to enhance your living space.",
            },
            {
                id: "fashion",
                name: "Fashion & Apparel",
                description: "Clothing, shoes, and accessories for all seasons and styles.",
            },
        ],
    },
    {
        id: "tasks",
        name: "Tasks",
        slug: "tasks",
        description: "Hire skilled taskers for various jobs",
        mainDescription: "Connect with Taskers. Hire Professionals. Get Jobs Done Quickly and Reliably.",
        subcategories: [
            {
                id: "moving-help",
                name: "Moving Help",
                description: "Professional movers and helpers for packing, loading, and moving your belongings.",
            },
            {
                id: "assembly",
                name: "Assembly Services",
                description: "Furniture assembly and equipment setup services for your convenience.",
            },
            {
                id: "delivery",
                name: "Delivery Services",
                description: "Professional delivery and pickup services for packages and large items.",
            },
        ],
    },
]
