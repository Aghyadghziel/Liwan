import { generate } from './texture-shaders';

/** Paints textures off the main thread. One request in, one set of pixels out (transferred, not copied). */
self.onmessage = (event: MessageEvent<{ id: number; key: string }>) => {
  const { id, key } = event.data;
  const pixels = generate(key);
  (self as unknown as Worker).postMessage({ id, pixels }, [pixels.colour.buffer, pixels.height.buffer]);
};
