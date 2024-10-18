export async function playAudioByUrl(url: string) {
	const buffer = await fetch(url).then((res) => res.arrayBuffer())
	const audioContext = new AudioContext()
	const audioBuffer = await audioContext.decodeAudioData(buffer)
	const source = audioContext.createBufferSource()
	source.buffer = audioBuffer
	source.connect(audioContext.destination)
	source.start()
}
