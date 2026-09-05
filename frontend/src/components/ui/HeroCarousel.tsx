import { useEffect, useState } from "react"

interface CarouselItem {
    id: number;
    src: string;
    alt: string;
}

const IMAGES: CarouselItem[] = [
    { id: 1, src: "/product_image_1.jpg", alt: "Product showcase-1" },
    { id: 2, src: "/product_image_2.jpg", alt: "Product showcase-2" },
    { id: 3, src: "/product_image_3.jpg", alt: "Product showcase-3" }
]

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
        }, 4000)

        return () => clearInterval(timer);
    }, [])


    return (
        <div className="relative w-full h-64 md:h-96 lg:h-[480px] overflow-hidden bg-muted">
            <div className="flex w-full h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {IMAGES.map((item) => (
                    <div key={item.id} className="w-full h-full flex-shrink-0">
                        <img
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === index ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
};