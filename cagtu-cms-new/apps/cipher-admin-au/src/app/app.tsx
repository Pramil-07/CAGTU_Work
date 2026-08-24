import { ErrorBoundary } from '@cagtu-cms/ui-shared';
import { BaseProvider } from '@cagtu-cms/ui-shared/views';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import './app.module.scss';
import BaseRouter from './Router/Router';

export function App() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                useErrorBoundary: true,
                retry: false,
            },
        },
    });
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BaseProvider>
                    <BrowserRouter>
                        <BaseRouter />
                    </BrowserRouter>
                </BaseProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
