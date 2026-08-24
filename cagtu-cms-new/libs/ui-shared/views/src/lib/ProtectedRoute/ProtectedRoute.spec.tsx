import { render } from '@testing-library/react';

import ProtectedRoutes from './ProtectedRoute';

describe('ProtectedRoutes', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<ProtectedRoutes />);
        expect(baseElement).toBeTruthy();
    });
});
