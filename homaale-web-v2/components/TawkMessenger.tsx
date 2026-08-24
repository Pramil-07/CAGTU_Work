import React, { useEffect } from 'react';

interface TawkMessengerProps {
    propertyId: string;
    widgetId: string;
}

const TawkMessengerReact: React.FC<TawkMessengerProps> = ({ propertyId, widgetId }) => {
    useEffect(() => {
        // Correctly construct the Tawk.to URL with both propertyId and widgetId
        const script = document.createElement('script');
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.async = true;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        // Add error handling
        script.onerror = (error) => {
            console.error('Error loading Tawk.to widget:', error);
        };

        document.body.appendChild(script);

        return () => {
            // Check if the script still exists before removing
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [propertyId, widgetId]);

    // Add a container div for the widget
    return <div id="tawk-messenger-container" />;
};

export default TawkMessengerReact;
