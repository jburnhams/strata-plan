import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import App from '@/App';

describe('Browser Integration Tests', () => {
  describe('index.html structure', () => {
    let htmlContent: string;

    beforeEach(() => {
      htmlContent = fs.readFileSync(
        path.join(__dirname, '..', '..', 'index.html'),
        'utf-8'
      );
    });

    it('has valid HTML structure with doctype', () => {
      expect(htmlContent).toMatch(/^<!doctype html>/i);
    });

    it('has correct language attribute', () => {
      expect(htmlContent).toMatch(/<html[^>]+lang="en"/i);
    });

    it('has required meta tags', () => {
      expect(htmlContent).toMatch(/<meta\s+charset="UTF-8"\s*\/?>/i);
      expect(htmlContent).toMatch(/<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*"\s*\/?>/i);
    });

    it('has a title element', () => {
      const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
      expect(titleMatch).toBeTruthy();
      expect(titleMatch?.[1]).toBeTruthy();
      expect(titleMatch?.[1].length).toBeGreaterThan(0);
    });

    it('has root div with correct id', () => {
      expect(htmlContent).toMatch(/<div\s+id="root"[^>]*>/i);
    });

    it('has main script tag pointing to correct entry point', () => {
      expect(htmlContent).toMatch(/<script\s+type="module"\s+src="\/src\/main\.tsx"[^>]*>/i);
    });

    it('has favicon link', () => {
      expect(htmlContent).toMatch(/<link\s+rel="icon"/i);
    });

    it('has proper HTML5 structure', () => {
      // Check for essential HTML5 elements
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('</head>');
      expect(htmlContent).toContain('<body>');
      expect(htmlContent).toContain('</body>');
      expect(htmlContent).toContain('</html>');
    });
  });

  describe('App component integration', () => {
    it('renders the app with StrataPlan branding', () => {
      render(<App />);

      // Check main heading (using updated role query)
      expect(screen.getByRole('heading', { name: 'StrataPlan' })).toBeInTheDocument();

      // Check new description text
      expect(
        screen.getByText(/Select a room or draw a wall to get started/i)
      ).toBeInTheDocument();
    });
  });

  describe('Full page rendering simulation', () => {
    it('simulates complete page load', () => {
      // Verify index.html exists and has root element
      const html = fs.readFileSync(
        path.join(__dirname, '..', '..', 'index.html'),
        'utf-8'
      );
      expect(html).toContain('id="root"');

      // Render the React app in jsdom environment (simulating what main.tsx does)
      render(<App />);

      // Verify initial state
      expect(screen.getByRole('heading', { name: 'StrataPlan' })).toBeInTheDocument();
      expect(screen.getByText(/Select a room or draw a wall/i)).toBeInTheDocument();
    });
  });
});
