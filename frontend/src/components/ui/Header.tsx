import { SearchIcon, ShoppingBag, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full px-4 py-3 md:px-8 flex items-center justify-between bg-background/80 backdrop-blur-md text-foreground border-b border-border transition-colors">
            <div>
                <img src="faesthatic_corner_logo.jpg" width={50} height={10} />
            </div>
            <div>
                <ul className="flex items-center gap-2 md:gap-4">
                    {/* Search Button */}
                    <li>
                        <button
                            type="button"
                            aria-label="Search"
                            className="orange p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </li>

                    {/* User Account Button */}
                    <li>
                        <button
                            type="button"
                            aria-label="User Account"
                            className="orange p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <User className="w-5 h-5" />
                        </button>
                    </li>

                    {/* Shopping Cart Button with Badge */}
                    <li className="relative">
                        <button
                            type="button"
                            aria-label="Cart"
                            className="orange p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                                2
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
        </header>
    )
};