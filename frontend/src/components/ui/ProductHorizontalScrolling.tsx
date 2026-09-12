import { useRef } from "react";
import { ProductItem } from "./ProductItem";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductItem {
    id: number;
    name: string;
    image: string;
    amount: number;
}

const PRODUCTS: ProductItem[] = [
    { id: 1, name: "Resin Art - 1", image: "/product_image_1.jpg", amount: 99 },
    { id: 2, name: "Resin Art - 2", image: "/product_image_2.jpg", amount: 99 },
    { id: 3, name: "Resin Art - 3", image: "/product_image_3.jpg", amount: 99 },
    { id: 4, name: "Resin Art - 4", image: "/product_image_1.jpg", amount: 99 },
    { id: 5, name: "Resin Art - 5", image: "/product_image_2.jpg", amount: 99 },
    { id: 6, name: "Resin Art - 6", image: "/product_image_3.jpg", amount: 99 },
    { id: 6, name: "Resin Art - 7", image: "/product_image_1.jpg", amount: 99 },
    { id: 6, name: "Resin Art - 8", image: "/product_image_2.jpg", amount: 99 },
]

export function ProductHorizontalScrolling() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === "right" ? scrollAmount : -scrollAmount,
                behavior: "smooth"
            });
        }
    }
    return (
        //Outer Div
        <div className="w-full h-full">
            <div>
                <div className="text-center font-semibold fw-700 text-lg">New Arrivals</div>
            </div>
            {PRODUCTS && PRODUCTS.length > 0 ? <div className="relative group w-full">
                <button
                    onClick={() => handleScroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md text-foreground hover:bg-background text-xl font-bold cursor-pointer"
                >
                    <ChevronLeft />
                </button>
                <div ref={scrollContainerRef} className="flex w-full h-full overflow-x-auto [scrollbar-width:none] gap-4 px-4 pb-4">
                    {PRODUCTS.map((p) => <ProductItem item={p} key={p.id} />)}
                    <button></button>
                </div>
                <button
                    onClick={() => handleScroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md text-foreground hover:bg-background text-xl font-bold cursor-pointer"
                >
                    <ChevronRight />
                </button>

            </div> : <div>
                <span>No Products Available
                </span>
            </div>}
        </div>
    )
};