
/* eslint-disable @typescript-eslint/no-explicit-any */

// Define all interfaces at the top
export interface Variable {
    name: string;
    initialValue: string;
    currentValue: string;
}
  
export interface Request {
    id: string;
    method: string;
    name: string;
    description: string;
    url: string;
}

export interface Folder {
    id: string;
    name: string;
    requests: Request[];
}

export interface Collection {
    id: string;
    name: string;
    description: string;
    variables: Variable[];
    folders: Folder[];
    requests: Request[];
}

export type IconName = 
  | 'dashboard' 
  | 'collections' 
  | 'requestBuilder' 
  | 'environments' 
  | 'team';

export interface SidebarIconProps {
  iconName: IconName;
}

// Define types for the sidebar items
export type SidebarItemType = {
    href: string;
    iconName: IconName;
    label: string;
};
  
export interface SidebarProps {
    activeTab: string;
}

export interface Param {
    enabled: boolean;
    key: string;
    value: string;
}
  
export interface Header {
    enabled: boolean;
    key: string;
    value: string;
}
  
export interface Auth {
    type: 'none' | 'bearer' | 'basic' | 'apiKey' | 'oauth2';
    credentials: {
        token?: string;
        username?: string;
        password?: string;
        key?: string;
        value?: string;
        addTo?: 'header' | 'query';
        clientId?: string;
        clientSecret?: string;
        tokenUrl?: string;
    };
}
  
export interface ResponseData {
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    cookies: Array<{
        name: string;
        value: string;
        domain: string;
        path: string;
    }>;
    timing: {
        start: number;
        end: number;
        phases: Array<{
            name: string;
            duration: number;
        }>;
    };
}
  
export enum RequestType {
    GET='GET',
    POST='POST',
    PUT='PUT',
    PATCH='PATCH',
    DELETE='DELETE',
    HEAD='HEAD',
    OPTIONS='OPTIONS'
}

export type TabType = 'Params' | 'Headers' | 'Body' | 'Auth' | 'Pre-request' | 'Tests';

export type ActiveResponseTab = "Response" | "Headers" | "Cookies" | "Timeline";

export type ResponseHeaders = {
    key: string;
    value: string;
}[];

export type CookiesType = {
    name: string;
    value: string;
    domain: string;
    path: string;
}[];

export type TimelineType =  {
    name: string;
    duration: number;
}[];


export type ActiveTab = 'profile' | 'security' | 'notifications' | 'preferences';

export type ErrorType = {
    current: string | null | undefined,
    new: string | null | undefined,
    confirm: string | null | undefined,
    message: string | null | undefined
}
