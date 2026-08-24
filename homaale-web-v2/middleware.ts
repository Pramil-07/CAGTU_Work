// eslint-disable-next-line @next/next/no-server-import-in-page
import type { NextRequest } from "next/server";
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
    "/profile",
    "/home",
    "/settings/*",
    "/add-service",
    "/payment/*",
    "/my-order",
    "/checkout",
    "/settings/account",
    "/refer",
    // "/explore",
    // "/mylist",
    // "/merchant"
];
const RESTRICTED_ROUTES_ON_LOGGED_IN = ["/auth/login", "/auth/signup"];

export default async function middleware(request: NextRequest) {
    const currentPath = request.nextUrl.pathname;
    const isPathProtected = () => {
        return PROTECTED_ROUTES.some((path) => {
            if (path.endsWith("*")) {
                const pathPrefix = path.slice(0, -1);
                return currentPath.startsWith(pathPrefix);
            }
            return PROTECTED_ROUTES.indexOf(currentPath) !== -1;
        });
    };
    const isRestrictedOnLoggedIn =
        RESTRICTED_ROUTES_ON_LOGGED_IN.indexOf(currentPath) !== -1;

    const access = request.cookies.get("access")?.value;

    if (!access && isPathProtected()) {
        return NextResponse.redirect(
            new URL(`/auth/login?next=${currentPath}`, request.nextUrl)
        );
    }
    if (access && isRestrictedOnLoggedIn) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
}
