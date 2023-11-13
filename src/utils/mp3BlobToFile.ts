import fs from 'fs';

export const mp3BlobToFile = async (blob: Blob, filepath: string) => {
  fs.writeFileSync(filepath, Buffer.from(await blob.arrayBuffer()));
};
