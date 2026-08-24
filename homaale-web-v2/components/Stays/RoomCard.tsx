import { useState } from 'react';
import {Box, Modal, Portal, useMantineTheme, Button} from '@mantine/core';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Users,
    Bed,
    Home,
    Cigarette,
    X,
    MoveDiagonal,
    CircleAlert, ChevronDown
} from 'lucide-react';

interface RoomCardProps {
    room: any;
}

export default function RoomCard({ room }: RoomCardProps) {
    const [imgIdx, setImgIdx] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const images = room.room_images ?? [];
    const theme = useMantineTheme();

    const nextImg = () => setImgIdx((i) => (i + 1) % images.length);
    const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length);

    return (
        <>
            <div className="flex-shrink-0 w-full snap-center bg-white border rounded-xl px-4 flex flex-col">
                {/* IMAGE CAROUSEL */}
                <div className="relative mb-3">
                    {images.length > 0 ? (
                        <>
                            <img
                                src={images[imgIdx]}
                                alt={room.name}
                                className="w-full h-64 object-cover rounded"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImg}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={nextImg}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                        {images.length}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="bg-gray-200 h-48 rounded flex items-center justify-center text-gray-500">
                            No image
                        </div>
                    )}
                </div>

                {/* TITLE */}
                <h3 className="font-semibold mb-2 cursor-pointer"
                    onClick={() => setIsExpanded(true)}>{room.name}</h3>

                {/* BASIC INFO */}
                <ul className="space-y-1 text-sm text-gray-700 mb-3">
                    <li className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        Capacity {room.capacity}
                    </li>
                    <li className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-600" />
                        {room.bed_count} × {room.bed_type}
                    </li>
                    {room.view_type && (
                        <li className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-600" />
                            {room.view_type}
                        </li>
                    )}
                    {room.room_area && (
                        <li className="flex items-center gap-2">
                            <MoveDiagonal className="w-4 h-4 text-gray-600" />
                            {room.room_area}
                        </li>
                    )}
                    <li className="flex items-center gap-2">
                        <Cigarette className="w-4 h-4 text-gray-600" />
                        {room.smoking_allowed ? 'Smoking allowed' : 'No-smoking'}
                    </li>
                </ul>

                {/* AMENITIES (first 5) */}
                {room.amenities?.length > 0 && (
                    <>
                        <h4>Amenities</h4>
                        <ul className="space-y-1 text-sm text-gray-700 -mt-2 mb-1">
                            {room.amenities.slice(0, 5).map((a: any) => (
                                <li key={a.id} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    {a.name}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <button
                    onClick={() => setIsExpanded(true)}
                    className="group flex items-center hover:underline text-sm font-semibold"
                    style={{
                        color: theme.colors.brand[5],
                    }}
                >
                    <span>Show more details</span>
                    <ChevronRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        strokeWidth={2.5}
                    />
                </button>

                {/* PRICE & BOOKING */}
                <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">
                            {room.offer_price && (
                                <span className="text-gray-500 line-through">${room.price}</span>
                            )}
                            {room.offer_price && (
                                <span className="ml-2 text-green-600 font-medium">
                                    ${room.offer_price} off
                                </span>
                            )}
                        </div>
                        <div className="text-md font-bold">
                            ${room.offer_price ?? room.price} nightly
                        </div>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                        <Check className="inline w-4 h-4 text-green-600" />
                        Total includes taxes & fees
                    </div>

                    <Button className="w-full text-white py-2 rounded font-medium">
                        Reserve
                    </Button>
                    <div className="text-xs text-center text-gray-600 mt-1">
                        You will not be charged yet
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isExpanded && (
                <Modal opened={isExpanded} onClose={() => setIsExpanded(false)} size={"lg"} radius={"lg"}>
                  <div className="bg-white">
                        {/* Content */}
                        <div>
                            {/* Image Gallery */}
                                <div className="relative mb-3">
                                    {images.length > 0 ? (
                                        <>
                                            <img
                                                src={images[imgIdx]}
                                                alt={room.name}
                                                className="w-full h-96 object-cover rounded-xl"
                                            />
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={prevImg}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={nextImg}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>

                                                    {/* Dot indicators */}
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                        {images.map((_: any, idx: number) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setImgIdx(idx)}
                                                                className={`w-2 h-2 rounded-full transition-all ${
                                                                    idx === imgIdx
                                                                        ? 'bg-white w-6'
                                                                        : 'bg-white/60 hover:bg-white/80'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center text-gray-500">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Strip */}
                                {images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {images.map((img: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setImgIdx(idx)}
                                                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                                                    idx === imgIdx
                                                        ? `border-[${theme.colors.brand[5]}]`
                                                        : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                            {/* Room Details */}
                            <h3 className="font-semibold text-xl mb-4">{room.name}</h3>

                            {/* BASIC INFO */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-2 mb-4">
                                    <div className="flex flex-col items-center text-center">
                                        <Home className="w-6 h-6 text-gray-700 mb-2" />
                                        <span className="text-xs text-gray-600">{room.view_type || "amazing view"}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <Users className="w-6 h-6 text-gray-700 mb-2" />
                                        <span className="text-xs text-gray-600">Capacity {room.capacity}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center text-center">
                                        <Cigarette className="w-6 h-6 text-gray-700 mb-2" />
                                        <span className="text-xs text-gray-600">{room.smoking_allowed ? 'Smoking allowed' : 'No-smoking'}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <MoveDiagonal className="w-6 h-6 text-gray-700 mb-2" />
                                        <span className="text-xs text-gray-600">{room.room_area || "not provided"}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <Bed className="w-6 h-6 text-gray-700 mb-2" />
                                        <span className="text-xs text-gray-600">{room.bed_count} × {room.bed_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ALL AMENITIES */}
                            {room.amenities?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Room amenities</h4>
                                    <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                        {room.amenities.map((a: any) => (
                                            <li key={a.id} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                {a.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* PRICE & BOOKING */}
                            <div className="p-4 border rounded-xl">
                                <h3 className="font-semibold">Room options</h3>

                                <div className="flex text-sm gap-2 text-center">
                                    <h4>Partially refundable</h4> <CircleAlert className="h-4 w-4 mt-0.5 "/>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm">
                                        {room.offer_price && (
                                            <span className="text-gray-500 line-through">${room.price}</span>
                                        )}
                                        {room.offer_price && (
                                            <span className="ml-2 text-green-600 font-medium">
                                                ${room.offer_price} off
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ">
                                        <p className="text-xl font-bold">${room.offer_price ?? room.price}</p>
                                        <p className="flex font-semibold items-center">nightly</p>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-600 mb-3">
                                    <Check className="inline w-4 h-4 text-green-600" />
                                    Total includes taxes & fees
                                </div>

                                <Button className="w-full text-white py-3 rounded-lg font-medium">
                                    Reserve
                                </Button>
                                <div className="text-xs text-center text-gray-600 mt-2">
                                    You will not be charged yet
                                </div>
                            </div>
                        </div>
               </div>
                </Modal>
            )}
        </>
    );
}
