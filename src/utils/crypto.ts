import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(text: string): string {
  // Initialization vector: Guarantee that every encryption will be different even if the key is the same
  const iv = randomBytes(12);
  // Creates the object that will do the encryption, recieves the ALGORITHM, the KEY that will be encrypted and the INITIALIZATION VECTOR
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  // Buffer is a memory space that stores the raw binary data. This buffer concats the result of update  and final
  const encrypted = Buffer.concat([
    // Gives a part of the encryption, because it is given in parts (blocks)
    cipher.update(text, "utf8"),
    // Signals that the encryption text has arrived to the end
    cipher.final(),
  ]);

  // 16 bytes signature that is used to confirm the encryption hasnt be adulterated. Used in decrypt to confirm that
  const authTag = cipher.getAuthTag();

  // Convert all the results into hexadecimal strings and separate them with ":"
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decrypt(stored: string): string {
  // Get all the Buffers separated by ":"
  const [ivHex, authTagHex, encryptedHex] = stored.split(":");

  // Reversed way: Read the bytes and convert into hexadecimal strings
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  // Creates an object that know how to undo the encryption
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  // Verifies the key was not changed, if it is, fails
  decipher.setAuthTag(authTag);

  // Same as the other one, but converts it to string (the original key)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}
