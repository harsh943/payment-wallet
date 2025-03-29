import React from "react";

export function Card({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <h1 className="text-xl font-semibold p-5 text-[#6a51a6] border-b border-gray-100">
        {title}
      </h1>
      <div className="p-5">{children}</div>
    </div>
  );
}