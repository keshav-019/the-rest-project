import Link from "next/link";
import { ReactNode } from "react";
import SidebarIcon from "./SidebarIcon";
import { IconName } from "@/types/Collections";

export default function SidebarItem({ href, iconName, children, isActive }: { href: string, iconName: IconName, children: ReactNode, isActive: boolean }) {
    const baseClasses = "px-5 py-3 cursor-pointer";
    const activeClasses = "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400";
    const inactiveClasses = "hover:bg-gray-100 dark:hover:bg-gray-700";
    const textActiveClasses = "text-blue-700 dark:text-blue-300";
    const textInactiveClasses = "text-gray-700 dark:text-gray-300";

    return (
        <li className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            <Link href={href} className={`flex items-center ${isActive ? textActiveClasses : textInactiveClasses}`}>
                <SidebarIcon iconName={iconName} />
                {children}
            </Link>
        </li>
    );
};