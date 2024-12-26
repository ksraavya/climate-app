import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command";
import { Clock, Loader2, Search, Star, XCircle } from "lucide-react";
import { useLocationSearch } from "@/hooks/use-weather";
import { useNavigate } from "react-router-dom";
import { useSearchHistory } from "@/hooks/use-search-history";
import { format } from "date-fns";
import { useFavourite } from "@/hooks/use-favourite";

const CitySearch = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const navigate = useNavigate();

    const { data: locations, isLoading } = useLocationSearch(debouncedQuery);
    const { history, clearHistory, addToHistory } = useSearchHistory();
    const { favourites } = useFavourite();

    const safeLocations = locations ?? [];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300); // Debounce delay (300ms)

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    const handleSelect = (cityData: string) => {
        const [lat, lon, name, country] = cityData.split("|");

        addToHistory.mutate({
            query,
            name,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            country,
        });

        setOpen(false);
        navigate(`city/${name}?lat=${lat}&lon=${lon}`);
    };

    return (
        <>
            <Button
                variant={"outline"}
                className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                Search cities...
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search cities..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {debouncedQuery.length > 2 && safeLocations.length === 0 && !isLoading && (
                        <CommandEmpty>No cities found.</CommandEmpty>
                    )}

                    {/* Render Favourites */}
                    {favourites.length > 0 && (
                        <CommandGroup heading="Favourites">
                            {favourites.map((location) => (
                                <CommandItem
                                    key={location.id}
                                    value={`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                                    onSelect={handleSelect}
                                >
                                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                                    <span>{location.name}</span>
                                    {location.state && (
                                        <span className="text-sm text-muted-foreground">
                                            , {location.state}
                                        </span>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        , {location.country}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {history.length > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup>
                                <div className="flex items-center justify-between px-2 my-2">
                                    <p className="text-xs text-muted-foreground">Recent Searches</p>
                                    <Button
                                        variant={"ghost"}
                                        size="sm"
                                        onClick={() => clearHistory.mutate()}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Clear
                                    </Button>
                                </div>

                                {history.map((location) => {
                                    return (
                                        <CommandItem
                                        key = {`${location.lat}-${location.lon}`}
                                        value = {`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                                        onSelect={handleSelect}
                                    >
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{location.name}</span>
                                        {location.state && (
                                            <span className="text-sm text-muted-foreground">
                                                , {location.state}
                                            </span>
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                            , {location.country}
                                        </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {format(location.searchedAt, "MMM d, h:mm a")}
                                        </span>
                                    </CommandItem>
                                    );
                                })}                                                        
                            </CommandGroup>
                        </>
                    )}

                    {/* Render Suggestions */}
                    {safeLocations.length > 0 && (
                        <CommandGroup heading="Suggestions">
                            {isLoading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            )}
                            {safeLocations.map((location) => (
                                <CommandItem
                                    key={`${location.lat}-${location.lon}`}
                                    value={`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                                    onSelect={handleSelect}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    <span>{location.name}</span>
                                    {location.state && (
                                        <span className="text-sm text-muted-foreground">
                                            , {location.state}
                                        </span>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        , {location.country}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
};

export default CitySearch;