/**
 * Creates a cropped image from the original image and crop area.
 * Used with react-easy-crop to convert crop coordinates into a File object.
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates an image element from a URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/**
 * Crops an image using canvas and returns a File object resized to outputSize.
 * @param imageSrc - Source URL of the image to crop
 * @param pixelCrop - Crop area in pixels (from react-easy-crop)
 * @param fileName - Name for the output file
 * @param fileType - MIME type for the output (default: image/png)
 * @param outputSize - Output dimensions in px (default: 256)
 * @returns Promise<File> - Cropped image as a File object
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  fileName: string = "cropped-image.png",
  fileType: string = "image/png",
  outputSize: number = 256
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Calculate output dimensions based on crop aspect ratio
  const cropAspectRatio = pixelCrop.width / pixelCrop.height;
  const outputWidth = outputSize;
  const outputHeight = Math.round(outputSize / cropAspectRatio);

  // Set canvas size to the calculated output dimensions
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped region scaled to the output size
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Convert canvas to blob and then to File
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], fileName, { type: fileType });
      resolve(file);
    }, fileType);
  });
}
