export interface PageTabNavbarProps {
    navbarOptions: PageTabNavbarOptions[];
}

export interface PageTabNavbarOptions {
    name: string;
    to: string;
    pageActivePath: string;
}
