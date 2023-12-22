# verifyBCMRHash.py

import requests
import hashlib


def get_bcmr_hash(bcmr_cid):
    bcmr_file = f"https://{bcmr_cid}.ipfs.nftstorage.link/"
    response = requests.get(bcmr_file)
    bcmr_content = response.text
    bcmr_hash = hashlib.sha256(bcmr_content.encode('utf-8')).hexdigest()
    return bcmr_hash


# Example usage
bcmr_cid = "bafxxx"
bcmr_hash = get_bcmr_hash(bcmr_cid)
print("BCMR hash:", bcmr_hash)
