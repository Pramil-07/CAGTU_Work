export interface Shop {
    id: number;
    name: string;
    owner: string;
    rating: number;
    reviews: number;
    description: string;
    image: string;
    products: Product[];
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    rating: number;
    reviews: number;
    image: string;
    features: string[];
}
