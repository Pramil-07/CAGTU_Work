export interface Review {
    rating: number;
    feedback: string;
}

export interface Merchant {
    name: string;
    address: string;
    phone: string;
    email: string;
    serviceArea: string;
    photos: string[];
    about?: string[];
    date?: string;
    reviews: Review[];
}

export const merchants: Merchant[] = [
    {
        name: "Alex Chaudhary",
        address: "Pepsicola, Kathmandu",
        phone: "9801122334",
        email: "alexjohnson@example.com",
        serviceArea: "Bhaktapur",
        photos: [
            "https://images.unsplash.com/photo-1521312706863-d5101a0a80b1"
        ],
        reviews: [
            {
                rating: 4.5,
                feedback: "Excellent service, timely and professional."
            },
            {
                rating: 4.0,
                feedback: "Very friendly and helpful, but a bit late yes."
            }
        ]
    },
    {
        name: "Kiran Shrestha",
        address: "Satdobato, Lalitpur",
        phone: "9821234567",
        email: "kiranshrestha@example.com",
        serviceArea: "Kathmandu",
        photos: [
            "https://images.unsplash.com/photo-1517841905240-472988babdf9"
        ],
        about: [
            "Kiran Shrestha is a skilled professional based in Satdobato, Lalitpur, specializing in providing top-notch services in the Kathmandu area. With a strong focus on customer satisfaction, he has built a reputation for reliability, professionalism, and attention to detail.",
            "Kiran believes in delivering quality and timely service to ensure client satisfaction. He emphasizes transparent communication, affordable pricing, and sustainable solutions for long-term results."
        ],
        date: "2024-11-14",
        reviews: [
            {
                rating: 4.8,
                feedback: "Reliable and professional, will use again."
            },
            {
                rating: 4.6,
                feedback: "Good service but slightly expensive."
            }
        ]


    },
    {
        name: "Sophia Sharma",
        address: "Baneshwor, Kathmandu",
        phone: "9812345678",
        email: "sophiasharma@example.com",
        serviceArea: "Lalitpur",
        photos: [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
        ],
        date: "2024-10-14",
        reviews: [
            {
                rating: 5.0,
                feedback: "Exceptional work! Highly recommended."
            },
            {
                rating: 4.8,
                feedback: "Very thorough and detail-oriented."
            }
        ]
    },
    {
        name: "Ramesh Koirala",
        address: "Jawalakhel, Lalitpur",
        phone: "9808765432",
        email: "rameshkoirala@example.com",
        serviceArea: "Kathmandu",
        photos: [
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df"
        ],
        reviews: [
            {
                rating: 4.2,
                feedback: "Good service but room for improvement in communication."
            },
            {
                rating: 4.0,
                feedback: "Affordable and reliable."
            }
        ]
    },
    {
        name: "Anjali Thapa",
        address: "Boudha, Kathmandu",
        phone: "9845678901",
        email: "anjalithapa@example.com",
        serviceArea: "Bhaktapur",
        photos: [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
        ],
        reviews: [
            {
                rating: 5.0,
                feedback: "Anjali went above and beyond. Fantastic service!"
            },
            {
                rating: 4.7,
                feedback: "Fast and efficient, highly skilled."
            }
        ]
    }
];
