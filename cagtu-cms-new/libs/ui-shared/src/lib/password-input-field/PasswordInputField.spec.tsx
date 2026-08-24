import { render } from '@testing-library/react';

import PasswordInputField from './PasswordInputField';

describe('PasswordInputField', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<PasswordInputField />);
        expect(baseElement).toBeTruthy();
    });
});
