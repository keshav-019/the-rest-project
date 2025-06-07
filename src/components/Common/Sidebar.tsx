import React from 'react';
import SidebarItem from "./SidebarItem";
import { SidebarItemType, SidebarProps } from '@/types/Collections';

const Sidebar: React.FC<SidebarProps> = ({ activeTab }) => {
    const items: SidebarItemType[] = [
        { href: "/", iconName: "dashboard", label: "Dashboard" },
        { href: "/collections", iconName: "collections", label: "Collections" },
        { href: "/", iconName: "requestBuilder", label: "Request Builder" },
        { href: "/environments", iconName: "environments", label: "Environments" },
        { href: "/teams", iconName: "team", label: "Team" }
    ];

    return (
        <nav className="mt-5">
            <ul>
                {items.map((item) => (
                    <SidebarItem
                        key={item.href}
                        href={item.href}
                        iconName={item.iconName}
                        isActive={activeTab === item.href}
                    >
                        {item.label}
                    </SidebarItem>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;