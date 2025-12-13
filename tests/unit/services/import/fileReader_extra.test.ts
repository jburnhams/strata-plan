import { readFileAsText, readFileAsArrayBuffer } from '../../../../src/services/import/fileReader';

describe('fileReader', () => {
  it('should read file as text', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const text = await readFileAsText(file);
    expect(text).toBe('hello');
  });

  it('should read file as ArrayBuffer', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const buffer = await readFileAsArrayBuffer(file);
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    const view = new Uint8Array(buffer);
    expect(view.length).toBe(5); // 'hello'.length
    // Wait, 'hello' length is 5.
    const decoder = new TextDecoder();
    expect(decoder.decode(buffer)).toBe('hello');
  });

  it('should handle read error', async () => {
    // Mock FileReader to fail
    const originalFileReader = window.FileReader;
    window.FileReader = class MockFileReader {
      readAsText() {
        this.onerror && this.onerror(new ProgressEvent('error') as any);
      }
      readAsArrayBuffer() {
        this.onerror && this.onerror(new ProgressEvent('error') as any);
      }
      onload: any;
      onerror: any;
    } as any;

    const file = new File([''], 'test.txt');
    await expect(readFileAsText(file)).rejects.toThrow('Failed to read file');
    await expect(readFileAsArrayBuffer(file)).rejects.toThrow('Failed to read file');

    window.FileReader = originalFileReader;
  });
});
