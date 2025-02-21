"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavTabsProps {
  tabs: {
    link: string;
    name: string;
  }[];
}

const NavTabs = ({ tabs }: NavTabsProps) => {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 text-sm">
      {tabs.map((tab) => (
        <Link
          key={tab.link}
          href={tab.link}
          className={cn(
            pathname === tab.link ? "bg-white" : "bg-gray-200",
            "py-2 px-4 rounded-sm"
          )}
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
};

export default NavTabs;
