"use client"

const tagsDesktop = [
    "Qaymoq", "Sut", "Muzqaymoq", "Shokolad", "Vanillali Yogurt", "Sirop",
    "Warrior Blend Organic", "Encore Seafoods Stuffed Alaskan Salmon", "Chao Cheese Creamy", "Chicken Meatballs",
    "Sweet Vanilla Essence Yogurt", "Werther's Caramel Hard Candies", "Mate Coffee Creamer",
    "Pasture Raised Chicken Eggs", "Tree Top Fruit Water", "Natural Vanilla Light Roast Coffee"
]

const tagsMobile = [
    "Qaymoq", "Sut", "Muzqaymoqlar", "Yog‘", "Sirop", "Shokolad", "Sharbat", "Makaronlar",
    "Sirop", "Shokolad", "Sharbat", "Makaronlar"
]

const features = [
    {
        icon: (
            // Delivery truck
            <svg className="w-7 h-7 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M3 17V6a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v11" />
                <circle cx="7.5" cy="18.5" r="1.5" />
                <circle cx="17.5" cy="18.5" r="1.5" />
                <path d="M21 17v-3.5a1 1 0 0 0-.293-.707l-2.5-2.5A1 1 0 0 0 17.5 10H18" />
            </svg>
        ),
        title: "Arzon Yetkazib Berish",
        text: "Toshkent Shaxri Bo‘ylab Arzon Yetkazib Berish Xizmati"
    },
    {
        icon: (
            // Shield check
            <svg className="w-7 h-7 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 4l7 4v5c0 5-7 9-7 9s-7-4-7-9V8z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
        title: "100% Sifatli Mahsulotlar",
        text: "Sifat Jihatdan Mutlaqo Havotirlanmaysiz"
    },
    {
        icon: (
            // Award
            <svg className="w-7 h-7 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="5" />
                <path d="M12 13v7M9 20l3-3 3 3" />
            </svg>
        ),
        title: "Sifatli Mahsulotlar",
        text: "Sifat Jihatdan Mutlaqo Havotirlanmaysiz"
    },
    {
        icon: (
            // Dollar sign
            <svg className="w-7 h-7 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />
            </svg>
        ),
        title: "Hamyonbop Narxlar",
        text: "Narxlar Sotib Olish Uchun Juda Qulay"
    },
    {
        icon: (
            // Present
            <svg className="w-7 h-7 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="12" rx="2" />
                <path d="M12 8V4M8.5 4A1.5 1.5 0 0 1 12 8A1.5 1.5 0 0 1 15.5 4" />
            </svg>
        ),
        title: "Kundalik Aksiyalar",
        text: "Aksiyalar Sizni Ko‘proq Qiziqtiradi"
    }
]

export function MostSearchedSection() {
    return (
        <section className="w-full py-7 px-1 sm:px-3 ">
            <div className="mx-auto container">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-neutral-900">Ko‘p Qidirilgan Mahsulotlar</h2>
                <div className="flex md:hidden flex-wrap gap-2 mb-7">
                    {tagsMobile.map((tag, i) => (
                        <span key={i} className="bg-[#FFDE87] text-base px-5 py-2 rounded-lg text-neutral-700 font-medium text-center">{tag}</span>
                    ))}
                </div>
            </div>
        </section>
    )
}