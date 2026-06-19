# Frontend Testing Plan (AcademicOS)

## 1. Unit Tests (Components & Hooks)
We will use **Vitest** combined with **React Testing Library** for lightning-fast unit testing.

**Target Coverage:**
- Reusable Components (`src/components/common/`): 80% coverage.
- Custom Hooks (`src/hooks/`): 90% coverage.

**Example Unit Test (`Button.test.tsx`):**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/common/Button';
import { describe, test, expect, vi } from 'vitest';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## 2. Integration Tests (Features & Flows)
Integration tests will ensure our pages correctly interact with the global state (Zustand) and server state (React Query). We will use **MSW (Mock Service Worker)** to mock API calls.

**Target Coverage:**
- Core flows (Login, Search, Checkout, ARIA Planner interactions).

**Example Integration Test (`LoginFlow.test.tsx`):**
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '@/pages/Login';
import { server, rest } from '@/mocks/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';

describe('Login Flow', () => {
  test('user logs in and is redirected', async () => {
    server.use(
      rest.post('/auth/login', (req, res, ctx) =>
        res(ctx.json({ token: 'abc123' }))
      )
    );
    
    render(<MemoryRouter><Login /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Test assertion for redirection
  });
});
```

## 3. End-to-End (E2E) Tests
We will use **Playwright** for E2E tests covering the most critical user journeys on staging environments.
- **Student Flow:** Login → Browse Catalog → Semantic Search → Add to "My Books" (Checkout).
- **Admin Flow:** Manage Inventory → View Audit Logs.
- **ARIA Planner:** Full 6-agent interaction.

## 4. Performance & Accessibility
- **Bundle Analysis:** Run `npm run build` with `rollup-plugin-visualizer` to keep initial JS under 250KB.
- **a11y:** Integrate `eslint-plugin-jsx-a11y` and test critical modals/forms with screen readers to ensure WCAG 2.1 AA compliance.
