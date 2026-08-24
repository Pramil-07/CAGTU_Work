import { render } from '@testing-library/react';

import TodoTask from './todo-task';

describe('TodoTask', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<TodoTask />);
        expect(baseElement).toBeTruthy();
    });
});
