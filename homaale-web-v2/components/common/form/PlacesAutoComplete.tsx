import {ActionIcon, Loader, Select} from "@mantine/core";
import {IconMap2, IconSearch, IconX} from "@tabler/icons-react";
import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import {getGoogleMapsApiKey} from "@/utils/getApiKey";



export const PlacesAutocomplete = ({
                                       setCurrentLocation,
                                       setOpenMap,
                                       openMap,
                                       initialvalue,
                                       error,
                                       onInputChange,
                                       postClicked
                                       
                                   }: {
    setCurrentLocation: Dispatch<SetStateAction<{ selected?: string, lat: number | null; lng: number | null }>>;
    setOpenMap?: React.Dispatch<React.SetStateAction<boolean>>;
    initialvalue?: string | null | undefined;
    openMap?: boolean;
    error?:React.ReactNode;
    onInputChange?: (value: string) => void;
postClicked?:boolean

}) => {
    const {
        value,
        setValue,
        suggestions: {status, data, loading},
        clearSuggestions,
    } = usePlacesAutocomplete({debounce: 300});
    const [selected, setSelected] = useState<string | null>(initialvalue ?? null);
    console.log('maplocation selected value in  search', selected)

    const locationItems = [
        // Include initialvalue as a fallback option if it exists and suggestions are empty
        ...(initialvalue && !data.length
            ? [{id: initialvalue, label: initialvalue, value: initialvalue}]
            : []),
        ...data.map((location) => ({
            id: location.description,
            label: location?.description,
            value: location?.description,
        })),
    ];

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!initialvalue || hasInitialized.current) return;

        setValue(initialvalue, false);
        setSelected(initialvalue);

        // If lat/lng already exists, do NOT re-geocode
        setCurrentLocation((prev) => {
            if (
                prev.selected === initialvalue &&
                prev.lat !== null &&
                prev.lng !== null
            ) {
                hasInitialized.current = true;
                return prev;
            }

            // Else, geocode
            getGeocode({address: initialvalue})
                .then((results) => {
                    const {lat, lng} = getLatLng(results[0]);

                    setCurrentLocation((prevInner) => {
                        const sameSelected = prevInner.selected === initialvalue;
                        const sameLat = isSameLocation(prevInner.lat, lat);
                        const sameLng = isSameLocation(prevInner.lng, lng);

                        if (sameSelected && sameLat && sameLng) {
                            return prevInner;
                        }

                        console.log("⚠️ Updated maplocation in useEffect", initialvalue, lat, lng);
                        return {selected: initialvalue, lat, lng};
                    });
                })
                .catch((error) =>
                    console.error("Error fetching geocode for initial value:", error)
                );

            return prev;
        });

        hasInitialized.current = true;
    }, [initialvalue, setCurrentLocation]);

    useEffect(() => {
        // If maplocation changes outside, sync to input
        if (initialvalue && initialvalue !== selected) {
            setSelected(initialvalue);
            setValue(initialvalue, false);
        }
    }, [initialvalue]);

    const isSameLocation = (a: number | null, b: number): boolean => {
        if (a === null) return false;
        return Math.abs(a - b) < 0.001; // now tolerance is ~110 meters
    };

    console.log('value', value)
    console.log('selected', selected)

    console.log('initial value', initialvalue)

    const handleSelect = (val: string | null) => {
        if (!val) return;

        const item = locationItems.find((i) => i.value === val);
        const label = item?.label ?? val;

        setSelected(val); // Set selected to the description
        setValue(label, false); // Update input value without triggering new suggestions

        // Get lat/lng for the selected location
        getGeocode({address: label})
            .then((results) => {
                const {lat, lng} = getLatLng(results[0]);
                console.log('maplocation getlatlng handleSelect ', initialvalue, lat, lng);

                setCurrentLocation({selected: label, lat, lng});
            })
            .catch((error) => {
                console.error("Error fetching geocode:", error);
            });
    };
    const handleClear = () => {
        setValue("");
        setSelected(null);
        clearSuggestions();
        setCurrentLocation({selected: undefined, lat: null, lng: null});
    };

    return (
        <Select
            icon={<IconSearch size={18}/>}
            
            rightSection={<>
                {!loading && value ? (
                    <ActionIcon onClick={handleClear}>
                        <IconX size={18}/>
                    </ActionIcon>
                ) : loading ? (
                    <Loader size="sm"/>
                ) : undefined}
                <ActionIcon className="mr-6">
                <IconMap2
                    color="skyblue"
                    size={18}
                    style={{cursor: 'pointer'}}
                    onClick={() => {
                        setOpenMap?.(!openMap);
                    }}
                />
                </ActionIcon>
            </>
            }
            label={setOpenMap ? "Address Information" : ""}
            placeholder="Search Any Location"
            searchable
            onSearchChange={(e) => {
                setValue(e)
                onInputChange?.(e);
            }}
            onChange={handleSelect}
            value={selected}
            className="rounded-3xl  "
            data={locationItems}
            error={error}
                                                                                                                                                                                                withAsterisk={postClicked}

        />
    );
};
