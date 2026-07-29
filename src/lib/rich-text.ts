const ALLOWED_TAGS = new Set([
    'A',
    'B',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'DIV',
    'EM',
    'H3',
    'H4',
    'I',
    'LI',
    'OL',
    'P',
    'PRE',
    'S',
    'STRONG',
    'U',
    'UL',
]);

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const looksLikeHtml = (value: string): boolean => /<\/?[a-z][\s\S]*>/i.test(value);

const plainTextToHtml = (value: string): string => {
    const paragraphs = value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    if (paragraphs.length === 0) {
        return '';
    }

    return paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');
};

const normalizeInput = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }

    return looksLikeHtml(trimmed) ? trimmed : plainTextToHtml(trimmed);
};

const isSafeHref = (href: string): boolean => {
    try {
        const parsed = new URL(href, window.location.origin);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
    } catch {
        return false;
    }
};

export const sanitizeRichText = (value: string): string => {
    const normalized = normalizeInput(value);
    if (!normalized) {
        return '';
    }

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return looksLikeHtml(value) ? '' : plainTextToHtml(value);
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(`<div>${normalized}</div>`, 'text/html');
    const root = document.body.firstElementChild;
    if (!root) {
        return '';
    }

    const cleanNode = (node: Node): Node | null => {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent || '');
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const element = node as HTMLElement;
        const tagName = element.tagName.toUpperCase();

        if (!ALLOWED_TAGS.has(tagName)) {
            const fragment = document.createDocumentFragment();
            element.childNodes.forEach((child) => {
                const cleaned = cleanNode(child);
                if (cleaned) {
                    fragment.appendChild(cleaned);
                }
            });
            return fragment;
        }

        const cleanElement = document.createElement(tagName.toLowerCase());

        if (tagName === 'A') {
            const href = element.getAttribute('href') || '';
            if (href && isSafeHref(href)) {
                cleanElement.setAttribute('href', href);
                cleanElement.setAttribute('target', '_blank');
                cleanElement.setAttribute('rel', 'noreferrer');
            }
        }

        element.childNodes.forEach((child) => {
            const cleaned = cleanNode(child);
            if (cleaned) {
                cleanElement.appendChild(cleaned);
            }
        });

        return cleanElement;
    };

    const output = document.createElement('div');
    root.childNodes.forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) {
            output.appendChild(cleaned);
        }
    });

    return output.innerHTML.trim();
};
