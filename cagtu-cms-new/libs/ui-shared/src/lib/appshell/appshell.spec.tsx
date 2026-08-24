import { render } from '@testing-library/react';

import Appshell from './appshell';

describe('Appshell', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Appshell />);
        expect(baseElement).toBeTruthy();
    });
});
