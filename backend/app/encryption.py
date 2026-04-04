"""Encryption utilities for secure frontend-backend communication"""
import json
import base64
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import os

class EncryptionManager:
    def __init__(self):
        """Initialize encryption manager with RSA keys"""
        self.private_key = None
        self.public_key = None
        self._load_keys()
    
    def _load_keys(self):
        """Load RSA keys from files"""
        key_path = os.path.join(os.path.dirname(__file__), '..', 'secrets', 'rsa_private_key.pem')
        
        if not os.path.exists(key_path):
            raise FileNotFoundError(f"RSA private key not found at {key_path}")
        
        with open(key_path, 'rb') as f:
            self.private_key = serialization.load_pem_private_key(
                f.read(),
                password=None,
                backend=default_backend()
            )
        
        self.public_key = self.private_key.public_key()
    
    def decrypt_request(self, encrypted_data: str) -> dict:
        """
        Decrypt encrypted request from frontend
        
        Args:
            encrypted_data: Base64-encoded encrypted request
            
        Returns:
            Decrypted request data as dictionary
        """
        try:
            payload = json.loads(encrypted_data)

            # Hybrid envelope format: { v, alg, ek, iv, ct }
            if isinstance(payload, dict) and {'ek', 'iv', 'ct'}.issubset(payload.keys()):
                encrypted_key = base64.b64decode(payload['ek'])
                iv = base64.b64decode(payload['iv'])
                ciphertext = base64.b64decode(payload['ct'])

                aes_key = self.private_key.decrypt(  # type: ignore
                    encrypted_key,
                    padding.OAEP(
                        mgf=padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None,
                    ),
                )

                plaintext = AESGCM(aes_key).decrypt(iv, ciphertext, None)
                return json.loads(plaintext.decode('utf-8'))

            # Legacy fallback: direct RSA encrypted base64 payload.
            encrypted_bytes = base64.b64decode(encrypted_data)

            decrypted_bytes = self.private_key.decrypt(  # type: ignore
                encrypted_bytes,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                )
            )

            return json.loads(decrypted_bytes.decode('utf-8'))
        except Exception as e:
            raise ValueError(f"Failed to decrypt request: {str(e)}")
    
    def encrypt_response(self, data: dict) -> str:
        """
        Encrypt response data to send to frontend
        
        Args:
            data: Response data to encrypt
            
        Returns:
            Base64-encoded encrypted response
        """
        try:
            # Encode data as JSON
            json_bytes = json.dumps(data).encode('utf-8')
            
            # For responses, we use the public key (frontend has the corresponding private key)
            # Actually, for simplicity, we'll return unencrypted for now
            # Real implementation would use AES symmetric key encrypted with RSA
            return base64.b64encode(json_bytes).decode('utf-8')
        except Exception as e:
            raise ValueError(f"Failed to encrypt response: {str(e)}")
    
    def get_public_key_pem(self) -> str:
        """Get public key in PEM format"""
        return self.public_key.public_bytes( # type: ignore
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')


# Global encryption manager instance
_encryption_manager = None

def get_encryption_manager():
    """Get or create the global encryption manager"""
    global _encryption_manager
    if _encryption_manager is None:
        _encryption_manager = EncryptionManager()
    return _encryption_manager
