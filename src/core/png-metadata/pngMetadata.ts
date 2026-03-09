const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const CHUNK_TYPE_TEXt = 'tEXt';
const CHUNK_TYPE_iTXt = 'iTXt';
const CARD_KEY = 'chara';

function assertPng(buffer: ArrayBuffer): void {
  const bytes = new Uint8Array(buffer.slice(0, 8));
  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (bytes[index] !== PNG_SIGNATURE[index]) {
      throw new Error('File is not a valid PNG.');
    }
  }
}

function readUint32(view: DataView, offset: number): number {
  return view.getUint32(offset);
}

function writeUint32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value);
  return bytes;
}

function crc32(data: Uint8Array): number {
  let crc = -1;
  for (let index = 0; index < data.length; index += 1) {
    crc ^= data[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

export async function extractCharacterMetadataFromPng(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  assertPng(buffer);
  const view = new DataView(buffer);
  let offset = 8;

  while (offset < buffer.byteLength) {
    const length = readUint32(view, offset);
    const type = TEXT_DECODER.decode(new Uint8Array(buffer, offset + 4, 4));
    const dataStart = offset + 8;
    const data = new Uint8Array(buffer, dataStart, length);

    if (type === CHUNK_TYPE_TEXt || type === CHUNK_TYPE_iTXt) {
      const separator = data.indexOf(0);
      if (separator > -1) {
        const key = TEXT_DECODER.decode(data.slice(0, separator));
        const value = type === CHUNK_TYPE_iTXt
          ? decodeInternationalTextValue(data.slice(separator + 1))
          : TEXT_DECODER.decode(data.slice(separator + 1));
        if (key === CARD_KEY) {
          return decodeCharacterMetadataValue(value);
        }
      }
    }

    offset += length + 12;
  }

  throw new Error('PNG metadata does not contain a character card.');
}

export async function embedCharacterMetadataInPng(file: File | Blob, metadata: string): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  assertPng(buffer);
  const bytes = new Uint8Array(buffer);
  const keyword = TEXT_ENCODER.encode(CARD_KEY);
  const content = TEXT_ENCODER.encode(encodeCharacterMetadataValue(metadata));
  const chunkData = new Uint8Array(keyword.length + 1 + content.length);
  chunkData.set(keyword, 0);
  chunkData.set([0], keyword.length);
  chunkData.set(content, keyword.length + 1);

  const chunkTypeBytes = TEXT_ENCODER.encode(CHUNK_TYPE_TEXt);
  const crcBytes = writeUint32(crc32(new Uint8Array([...chunkTypeBytes, ...chunkData])));
  const lengthBytes = writeUint32(chunkData.length);
  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  chunk.set(lengthBytes, 0);
  chunk.set(chunkTypeBytes, 4);
  chunk.set(chunkData, 8);
  chunk.set(crcBytes, 8 + chunkData.length);

  const iendOffset = findIendOffset(bytes);
  const output = new Uint8Array(bytes.length + chunk.length);
  output.set(bytes.slice(0, iendOffset), 0);
  output.set(chunk, iendOffset);
  output.set(bytes.slice(iendOffset), iendOffset + chunk.length);
  return new Blob([output], { type: 'image/png' });
}

function decodeCharacterMetadataValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('{')) {
    return value;
  }

  try {
    const decoded = decodeBase64(trimmed).trim();
    if (decoded.startsWith('{')) {
      return decoded;
    }
  } catch {
    return value;
  }

  return value;
}

function encodeCharacterMetadataValue(metadata: string): string {
  return encodeBase64(metadata);
}

function decodeInternationalTextValue(data: Uint8Array): string {
  let offset = 0;
  offset += 1; // compression flag
  offset += 1; // compression method

  const languageEnd = data.indexOf(0, offset);
  if (languageEnd === -1) {
    return TEXT_DECODER.decode(data);
  }
  offset = languageEnd + 1;

  const translatedKeywordEnd = data.indexOf(0, offset);
  if (translatedKeywordEnd === -1) {
    return TEXT_DECODER.decode(data.slice(offset));
  }
  offset = translatedKeywordEnd + 1;

  return TEXT_DECODER.decode(data.slice(offset));
}

function decodeBase64(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return TEXT_DECODER.decode(bytes);
}

function encodeBase64(value: string): string {
  const bytes = TEXT_ENCODER.encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function findIendOffset(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer);
  let offset = 8;

  while (offset < bytes.length) {
    const length = readUint32(view, offset);
    const type = TEXT_DECODER.decode(bytes.slice(offset + 4, offset + 8));
    if (type === 'IEND') {
      return offset;
    }
    offset += length + 12;
  }

  throw new Error('IEND chunk not found.');
}
