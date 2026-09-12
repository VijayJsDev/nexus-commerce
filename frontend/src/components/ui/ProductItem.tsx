export function ProductItem({ item }) {
    return (
        <div className="w-[200px] sm:w-[240px] md:w-[280px] shrink-0 flex flex-col">
            <img src={item.image} className="w-full aspect-square object-cover rounded-lg" />
            <div>{item.name}</div>
            <div>{item.amount}</div>
            <button>Add to Cart</button>
        </div>
    )
};