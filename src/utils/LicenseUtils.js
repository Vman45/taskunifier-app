import { Buffer } from 'buffer';
import moment from 'moment';
import { getConfig } from 'config/Config';

const PUBLIC_KEY = getConfig().license.publicKey;

export function verifyLicense(license) {
    if (process.env.REACT_APP_MODE === 'react') {
        return null;
    }

    const electron = window.require('electron');
    const crypto = electron.remote.require('crypto');

    if (!license || license.length <= 512) {
        return null;
    }

    const signature = license.substr(0, 512);
    const message = license.substr(512);

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(message);

    if (verifier.verify(PUBLIC_KEY, signature, 'hex')) {
        const jsonContent = Buffer.from(message, 'hex').toString();

        try {
            const content = JSON.parse(jsonContent);

            // Backward compatibility with older licenses
            const sku = content.sku || content.itemSku;

            if (sku !== getConfig().appItemSku && sku !== getConfig().appTrialItemSku) {
                return null;
            }

            if (content.expirationDate && moment(content.expirationDate).isBefore(moment())) {
                return null;
            }

            return content;
        } catch (e) {
            return null;
        }
    } else {
        return null;
    }
}