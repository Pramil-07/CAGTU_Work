import { render } from '@testing-library/react';

import LoginSignupForm from './login-signup-form';

describe('LoginSignupForm', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<LoginSignupForm />);
        expect(baseElement).toBeTruthy();
    });
});
