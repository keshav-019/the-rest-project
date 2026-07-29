export const MAX_UPLOAD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const DEFAULT_CLOUDINARY_CLOUD_NAME = 'depzyau1x';
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = 'profile_pics';

const isSafeImageUrl = (value: unknown): value is string => {
    if (typeof value !== 'string') {
        return false;
    }

    try {
        const parsed = new URL(value);
        return parsed.protocol === 'https:' && parsed.hostname.endsWith('cloudinary.com');
    } catch {
        return false;
    }
};

const readCloudinaryErrorMessage = (payload: unknown): string => {
    if (!payload || typeof payload !== 'object') {
        return 'Image upload failed.';
    }

    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === 'object') {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
            return message;
        }
    }

    const message = (payload as { message?: unknown }).message;
    return typeof message === 'string' && message.trim() ? message : 'Image upload failed.';
};

export async function uploadImageToCloudinary(file: Blob, fileName = 'profile-picture.jpg'): Promise<string> {
    if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
    }

    if (file.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
        throw new Error('Image must be 5 MB or smaller.');
    }

    const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? DEFAULT_CLOUDINARY_CLOUD_NAME).trim();
    const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? DEFAULT_CLOUDINARY_UPLOAD_PRESET).trim();

    if (!cloudName || !uploadPreset) {
        throw new Error(
            'Missing Cloudinary configuration. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
        );
    }

    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: formData,
    });
    const payload = (await response.json().catch(() => null)) as { secure_url?: unknown } | null;

    if (!response.ok || !payload) {
        throw new Error(readCloudinaryErrorMessage(payload));
    }

    if (!isSafeImageUrl(payload.secure_url)) {
        throw new Error('Cloudinary did not return a valid secure image URL.');
    }

    return payload.secure_url;
}
