import { render } from '@testing-library/react';

import NoMatch from './NoMatch';

describe('NoMatch', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<NoMatch />);
        expect(baseElement).toBeTruthy();
    });
});
