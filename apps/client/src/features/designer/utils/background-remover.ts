/**
 * Background removal utility using Transformers.js RMBG-1.4 (briaai/RMBG-1.4)
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

    // Use standard WASM across all platforms for stable RMBG-1.4 custom architecture
    modelPromise = AutoModel.from_pretrained("briaai/RMBG-1.4", {
      config: { model_type: "custom" } as any,
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
}
