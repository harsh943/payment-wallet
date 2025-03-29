"use client";
// @ts-ignore
import { useBalance } from "@repo/store/balance";

export default function HomePage() {
  const balance = useBalance();
  
  return (
    <div>
      hi there {balance}
    </div>
  );
}