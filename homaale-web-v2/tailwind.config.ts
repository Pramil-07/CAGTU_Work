import type {Config} from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                orangeDark: {
                    '50': '#fff9ed',
                    '100': '#fff3d4',
                    '200': '#ffe2a8',
                    '300': '#ffcd70',
                    '400': '#ffab37',
                    '500': '#ff971d',
                    '600': '#f07406',
                    '700': '#c75807',
                    '800': '#9e450e',
                    '900': '#7f3b0f',
                    '950': '#451b05'
                },
                orangeLite: {
                    '50': '#fff5ed',
                    '100': '#ffe8d6',
                    '200': '#feccaa',
                    '300': '#fda874',
                    '400': '#fb793c',
                    '500': '#f95516',
                    '600': '#ea3b0c',
                    '700': '#c2290c',
                    '800': '#9a2212',
                    '900': '#7c1f12',
                    '950': '#430c07'
                },
                hintRed: {
                    '50': '#f9f6f7',
                    '100': '#f3edef',
                    '200': '#eadee2',
                    '300': '#dbc6cd',
                    '400': '#c4a5af',
                    '500': '#ad8693',
                    '600': '#966c7a',
                    '700': '#7d5864',
                    '800': '#694b55',
                    '900': '#59434a',
                    '950': '#2e2125'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
