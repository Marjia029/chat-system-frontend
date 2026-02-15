
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

export const cryptoUtils = {
  // Generate a new key pair
  generateKeyPair: () => {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: util.encodeBase64(keyPair.publicKey),
      secretKey: util.encodeBase64(keyPair.secretKey),
    };
  },

  // Encrypt a message
  encrypt: (message, recipientPublicKeyBase64, senderSecretKeyBase64) => {
    try {
      const recipientPublicKey = util.decodeBase64(recipientPublicKeyBase64);
      const senderSecretKey = util.decodeBase64(senderSecretKeyBase64);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const messageUint8 = util.decodeUTF8(message);

      const encryptedBox = nacl.box(
        messageUint8,
        nonce,
        recipientPublicKey,
        senderSecretKey
      );

      const fullMessage = new Uint8Array(nonce.length + encryptedBox.length);
      fullMessage.set(nonce);
      fullMessage.set(encryptedBox, nonce.length);

      return util.encodeBase64(fullMessage);
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  },

  // Decrypt a message
  decrypt: (encryptedMessageBase64, senderPublicKeyBase64, recipientSecretKeyBase64) => {
    try {
      const messageWithNonceAsUint8 = util.decodeBase64(encryptedMessageBase64);
      const nonce = messageWithNonceAsUint8.slice(0, nacl.box.nonceLength);
      const message = messageWithNonceAsUint8.slice(
        nacl.box.nonceLength,
        messageWithNonceAsUint8.length
      );

      const senderPublicKey = util.decodeBase64(senderPublicKeyBase64);
      const recipientSecretKey = util.decodeBase64(recipientSecretKeyBase64);

      const decrypted = nacl.box.open(
        message,
        nonce,
        senderPublicKey,
        recipientSecretKey
      );

      if (!decrypted) {
        throw new Error('Could not decrypt message');
      }

      return util.encodeUTF8(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  },
};
