'use client';

import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
    return (
        <AppProgressBar
            height="4px" // Standard height for progress bar
            color="#1d4ed8" // Blue for visibility
            options={{ showSpinner: false }}
            shallowRouting // Enable for client-side navigation
        />
    );
}