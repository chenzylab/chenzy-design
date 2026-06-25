// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  useInertBackground,
  __resetInertBackground,
} from './inert-background.js';

let page: HTMLElement;
let overlayA: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '';
  page = document.createElement('div');
  page.id = 'page';
  overlayA = document.createElement('div');
  overlayA.id = 'overlay-a';
  document.body.append(page, overlayA);
});

afterEach(() => {
  __resetInertBackground();
  document.body.innerHTML = '';
});

describe('useInertBackground', () => {
  it('hides siblings of the overlay root and restores on release', () => {
    const release = useInertBackground(overlayA);
    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(page.hasAttribute('inert')).toBe(true);
    // the overlay root itself stays interactive
    expect(overlayA.getAttribute('aria-hidden')).toBeNull();
    expect(overlayA.hasAttribute('inert')).toBe(false);
    release();
    expect(page.getAttribute('aria-hidden')).toBeNull();
    expect(page.hasAttribute('inert')).toBe(false);
  });

  it('release is idempotent', () => {
    const release = useInertBackground(overlayA);
    release();
    release();
    expect(page.getAttribute('aria-hidden')).toBeNull();
  });

  it('restores a pre-existing aria-hidden value', () => {
    page.setAttribute('aria-hidden', 'false');
    const release = useInertBackground(overlayA);
    expect(page.getAttribute('aria-hidden')).toBe('true');
    release();
    expect(page.getAttribute('aria-hidden')).toBe('false');
  });

  it('stacked overlays: topmost hides lower overlay, keeps itself interactive', () => {
    const overlayB = document.createElement('div');
    overlayB.id = 'overlay-b';
    document.body.appendChild(overlayB);

    const releaseA = useInertBackground(overlayA);
    expect(page.hasAttribute('inert')).toBe(true);

    // B opens on top → page AND overlayA become inert; B stays interactive.
    const releaseB = useInertBackground(overlayB);
    expect(page.hasAttribute('inert')).toBe(true);
    expect(overlayA.hasAttribute('inert')).toBe(true);
    expect(overlayB.hasAttribute('inert')).toBe(false);

    // B closes → A is topmost again: page inert, A interactive.
    releaseB();
    expect(page.hasAttribute('inert')).toBe(true);
    expect(overlayA.hasAttribute('inert')).toBe(false);

    releaseA();
    expect(page.hasAttribute('inert')).toBe(false);
  });
});
