// Encryption utilities for frontend-backend communication
import { RSA_PUBLIC_KEY } from '../config/encryption'

let publicKeyObject = null

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function bytesToBase64(bytes) {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

function base64ToBytes(value) {
    const binary = atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

/**
 * Load and convert PEM format public key to usable format
 */
async function loadPublicKey() {
    if (publicKeyObject) return publicKeyObject

    try {
        const binaryString = atob(
            RSA_PUBLIC_KEY
                .replace('-----BEGIN PUBLIC KEY-----', '')
                .replace('-----END PUBLIC KEY-----', '')
                .replace(/\s/g, '')
        )
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }

        publicKeyObject = await crypto.subtle.importKey(
            'spki',
            bytes.buffer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            false,
            ['encrypt']
        )
        return publicKeyObject
    } catch (error) {
        console.error('Failed to load public key:', error)
        throw error
    }
}

/**
 * Encrypt data using RSA public key
 * @param {Object} data - Data to encrypt
 * @returns {Promise<string>} Base64-encoded encrypted data
 */
export async function encryptData(data) {
    try {
        const publicKey = await loadPublicKey()
        const plaintext = textEncoder.encode(JSON.stringify(data))

        // Hybrid scheme: AES-GCM for payload + RSA-OAEP for AES key.
        const aesKey = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt']
        )
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            aesKey,
            plaintext
        )

        const rawAesKey = new Uint8Array(await crypto.subtle.exportKey('raw', aesKey))
        const encryptedKey = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            rawAesKey
        )

        return JSON.stringify({
            v: 1,
            alg: 'RSA-OAEP+AES-GCM',
            ek: bytesToBase64(new Uint8Array(encryptedKey)),
            iv: bytesToBase64(iv),
            ct: bytesToBase64(new Uint8Array(ciphertext)),
        })
    } catch (error) {
        console.error('Encryption failed:', error)
        throw error
    }
}

/**
 * Decrypt data (for responses from backend)
 * In this implementation, responses are base64-encoded but not encrypted
 * Can be extended to use symmetric key encryption
 * @param {string} encryptedData - Base64-encoded data
 * @returns {Object} Decrypted data
 */
export function decryptData(encryptedData) {
    try {
        // If response is plain JSON, parse directly.
        if (typeof encryptedData === 'string' && (encryptedData.startsWith('{') || encryptedData.startsWith('['))) {
            return JSON.parse(encryptedData)
        }

        // Backward compatibility for legacy base64(JSON) responses.
        const bytes = base64ToBytes(encryptedData)
        return JSON.parse(textDecoder.decode(bytes))
    } catch (error) {
        console.error('Decryption failed:', error)
        throw error
    }
}
