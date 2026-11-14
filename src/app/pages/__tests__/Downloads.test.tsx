import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Downloads from '../Downloads';

describe('Downloads', () => {
  it('links to the published Android APK and clearly marks desktop as not yet available', () => {
    render(
      <MemoryRouter>
        <Downloads />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: 'Download Android APK' }).getAttribute('href')
    ).toBe('https://github.com/ShashwatEv/projectflow/releases/download/Projectflow/ProjectFlow.apk');
    expect(
      screen.getByRole('button', { name: 'Windows installer coming soon' })
    ).toBeDisabled();
    expect(screen.getByRole('link', { name: /browse releases/i })).toHaveAttribute(
      'href',
      'https://github.com/ShashwatEv/projectflow/releases'
    );
  });
});
