/**
 * Converts a Blob object to a base64 encoded string
 * @param blob - The Blob object to be converted
 * @returns A Promise that resolves with the base64 string representation of the blob
 */
export function blobToBase64(blob: Blob) {
  // Create a new Promise to handle the asynchronous conversion
  return new Promise<string>((resolve) => {
    // Create a new FileReader instance to read the blob
    const reader = new FileReader()

    // Set up the onload event handler
    // This will be called when the FileReader completes reading the blob
    reader.onload = () => {
      // Resolve the promise with the base64 string result
      resolve(reader.result as string)
    }

    // Start reading the blob as a data URL (base64 encoded string)
    reader.readAsDataURL(blob)
  })
}
