import { describe, it, expect } from 'vitest';
import { ThesisDB } from '../db';

describe('ThesisDB schema', () => {
  it('exports a ThesisDB class', () => {
    expect(ThesisDB).toBeDefined();
    const db = new ThesisDB();
    expect(db.projects).toBeDefined();
    expect(db.files).toBeDefined();
    expect(db.assets).toBeDefined();
  });
});
