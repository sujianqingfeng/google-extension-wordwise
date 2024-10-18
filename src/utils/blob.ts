export function blobToBase64(blob: Blob) {
	return new Promise<string>((resolve) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result as string)
		}
		reader.readAsDataURL(blob)
	})
}
