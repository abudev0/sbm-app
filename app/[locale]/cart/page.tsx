// import CartPage from "@/components/cart-page";
import dynamic from "next/dynamic";

const CartPage = dynamic(() => import("@/components/cart-page"), {
  ssr: false, // serverda render qilmaymiz -> hydration mismatch bo‘lmaydi
})

export default function Page() {
    return <div className=" ">
        <CartPage />
    </div>
}
