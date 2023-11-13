export async function fetchMP3Blob(url: string) {
  try {
    // Fetch the MP3 file as a ReadableStream
    const response = await fetch(url);

    if (response.ok) {
      const mp3Buffer = await response.arrayBuffer();

      // Create a Blob from the binary data
      return new Blob([mp3Buffer], { type: 'audio/mpeg' });
    } else {
      console.error('Failed to fetch MP3 file.');
    }
  } catch (error) {
    console.error('Error when preparing MP3 blob:', error);
  }
}
