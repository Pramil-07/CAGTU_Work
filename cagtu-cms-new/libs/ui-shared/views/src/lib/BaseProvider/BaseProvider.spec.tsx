import { render } from '@testing-library/react';

import BaseProvider from './BaseProvider';

describe('BaseProvider', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<BaseProvider />);
        expect(baseElement).toBeTruthy();
    });
});
