/**
 * Background removal utility using Transformers.js and RMBG-1.4 (briaai/RMBG-1.4)
 * with graceful fallback to edge-connected flood fill.
 */

let modelPromise: Promise<any> | null = null;
let processorPromise: Promise<any> | null = null;

async function getRMBGModel() {
  if (!modelPromise || !processorPromise) {
    const { AutoModel, AutoProcessor, env } = await import(
      "@huggingface/transformers"
    );

    // Disable local filesystem model search in browser
    env.allowLocalModels = false;

    // Prefer WebGPU for asynchronous non-blocking GPU execution, fallback to WASM
    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
    const device = hasWebGPU ? "webgpu" : "wasm";

    modelPromise = AutoModel.from_pretrained("briaai/RMBG-1.4", {
      device,
      config: { model_type: "custom" } as any,
    }).catch(async (err) => {
      if (device === "webgpu") {
        console.warn("WebGPU failed, falling back to WASM:", err);
        return AutoModel.from_pretrained("briaai/RMBG-1.4", {
          device: "wasm",
          config: { model_type: "custom" } as any,
        });
      }
      throw err;
    });

    processorPromise = AutoProcessor.from_pretrained("briaai/RMBG-1.4", {
      config: {
        do_normalize: true,
        do_pad: false,
        do_rescale: true,
        do_resize: true,
        image_mean: [0.5, 0.5, 0.5],
        feature_extractor_type: "ImageFeatureExtractor",
        image_std: [1, 1, 1],
        resample: 2,
        rescale_factor: 0.00392156862745098,
        size: { width: 1024, height: 1024 },
      } as any,
    });
  }

  const [model, processor] = await Promise.all([
    modelPromise,
    processorPromise,
  ]);
  return { model, processor };
}

/**
 * Remove background using Transformers.js RMBG-1.4 model
 */
export async function removeBackgroundWithRMBG(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const { RawImage } = await import("@huggingface/transformers");

    onProgress?.("ກຳລັງໂຫລດໂມເດວ AI...");
    await new Promise((r) => setTimeout(r, 50));
    const { model, processor } = await getRMBGModel();

    onProgress?.("ກຳລັງປະມວນຜົນ...");
    // Yield to let browser update text and render animation
    await new Promise((r) => setTimeout(r, 50));

    // Convert source element to canvas data
    const width = (imageElement as any).naturalWidth || imageElement.width;
    const height = (imageElement as any).naturalHeight || imageElement.height;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(imageElement, 0, 0, width, height);

    const rawImage = await RawImage.fromCanvas(canvas);

    // Preprocess image
    await new Promise((r) => setTimeout(r, 10));
    const { pixel_values } = await processor(rawImage);

    // Model inference
    await new Promise((r) => setTimeout(r, 10));
    const { output } = await model({ input: pixel_values });

    // Generate mask tensor to uint8 image
    await new Promise((r) => setTimeout(r, 10));
    const mask = await RawImage.fromTensor(
      output[0].mul(255).to("uint8")
    ).resize(width, height);

    // Apply alpha mask to image
    rawImage.putAlpha(mask);

    // Render result to output canvas
    const outCanvas = document.createElement("canvas");
    outCanvas.width = width;
    outCanvas.height = height;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) throw new Error("Output context unavailable");

    const rgba = rawImage.clone().rgba();
    const imgData = new ImageData(
      new Uint8ClampedArray(rgba.data),
      width,
      height
    );
    outCtx.putImageData(imgData, 0, 0);

    return outCanvas.toDataURL("image/png");
  } catch (err) {
    console.warn("RMBG-1.4 inference fallback to smart flood fill:", err);
    // Fallback to local edge flood fill if network/WASM fails
    return fallbackColorRemove(imageElement);
  }
}

/**
 * Fast client-side edge-connected flood-fill fallback
 */
function fallbackColorRemove(
  imageElement: HTMLImageElement | HTMLCanvasElement
): string {
  const width = (imageElement as any).naturalWidth || imageElement.width;
  const height = (imageElement as any).naturalHeight || imageElement.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(imageElement, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);

  removeBackgroundFromImageData(imgData);

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function removeBackgroundFromImageData(
  imageData: ImageData,
  tolerance = 38
): ImageData {
  const { width, height, data } = imageData;
  const visited = new Uint8Array(width * height);

  const samplePoints: [number, number][] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];

  const seedColors: [number, number, number][] = [];
  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a > 20) {
      seedColors.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  if (seedColors.length === 0) {
    seedColors.push([255, 255, 255]);
  }

  function matchesSeed(r: number, g: number, b: number): number {
    let minDist = 9999;
    for (const [sr, sg, sb] of seedColors) {
      const dr = r - sr;
      const dg = g - sg;
      const db = b - sb;
      const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }

  const queue = new Int32Array(width * height);
  let qHead = 0;
  let qTail = 0;

  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const pIdx = y * width + x;
      if (!visited[pIdx]) {
        const idx = pIdx * 4;
        const a = data[idx + 3];
        if (a === 0 || matchesSeed(data[idx], data[idx + 1], data[idx + 2]) <= tolerance) {
          visited[pIdx] = 1;
          queue[qTail++] = pIdx;
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const pIdx = y * width + x;
      if (!visited[pIdx]) {
        const idx = pIdx * 4;
        const a = data[idx + 3];
        if (a === 0 || matchesSeed(data[idx], data[idx + 1], data[idx + 2]) <= tolerance) {
          visited[pIdx] = 1;
          queue[qTail++] = pIdx;
        }
      }
    }
  }

  while (qHead < qTail) {
    const pIdx = queue[qHead++];
    const x = pIdx % width;
    const y = Math.floor(pIdx / width);
    const idx = pIdx * 4;

    data[idx + 3] = 0;

    const neighbors = [
      x > 0 ? pIdx - 1 : -1,
      x < width - 1 ? pIdx + 1 : -1,
      y > 0 ? pIdx - width : -1,
      y < height - 1 ? pIdx + width : -1,
    ];

    for (const nIdx of neighbors) {
      if (nIdx !== -1 && !visited[nIdx]) {
        const nDataIdx = nIdx * 4;
        const na = data[nDataIdx + 3];
        if (na === 0) {
          visited[nIdx] = 1;
          queue[qTail++] = nIdx;
        } else {
          const dist = matchesSeed(data[nDataIdx], data[nDataIdx + 1], data[nDataIdx + 2]);
          if (dist <= tolerance) {
            visited[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }
  }

  return imageData;
}
