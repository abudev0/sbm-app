import dynamic from "next/dynamic";

const SuccessPage = dynamic(() => import("@/components/checkout/success-page"), { ssr: false });

export default function Page() {
  return (
    <div className=" ">
      <SuccessPage />
    </div>
  );
}