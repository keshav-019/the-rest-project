'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link,
    Quote,
    Code,
    RemoveFormatting,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { sanitizeRichText } from '@/lib/rich-text';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    minHeightClassName?: string;
}

interface ToolbarButton {
    command: string;
    value?: string;
    label: string;
    icon: LucideIcon;
}

const toolbarGroups: ToolbarButton[][] = [
    [
        { command: 'bold', label: 'Bold', icon: Bold },
        { command: 'italic', label: 'Italic', icon: Italic },
        { command: 'underline', label: 'Underline', icon: Underline },
    ],
    [
        { command: 'insertUnorderedList', label: 'Bulleted list', icon: List },
        { command: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered },
        { command: 'formatBlock', value: 'blockquote', label: 'Quote', icon: Quote },
        { command: 'formatBlock', value: 'pre', label: 'Code block', icon: Code },
    ],
    [
        { command: 'createLink', label: 'Link', icon: Link },
        { command: 'removeFormat', label: 'Clear formatting', icon: RemoveFormatting },
    ],
];

export default function RichTextEditor({
    value,
    onChange,
    minHeightClassName = 'min-h-[180px]',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor || isFocused) {
            return;
        }

        const sanitizedValue = sanitizeRichText(value);
        if (editor.innerHTML !== sanitizedValue) {
            editor.innerHTML = sanitizedValue;
        }
    }, [isFocused, value]);

    const emitChange = () => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        onChange(sanitizeRichText(editor.innerHTML));
    };

    const runCommand = (command: string, valueOverride?: string) => {
        editorRef.current?.focus();

        if (command === 'createLink') {
            const href = window.prompt('Paste a link');
            if (!href) {
                return;
            }
            document.execCommand(command, false, href);
        } else {
            document.execCommand(command, false, valueOverride);
        }

        emitChange();
    };

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2 dark:border-gray-700 dark:bg-gray-800">
                {toolbarGroups.map((group, groupIndex) => (
                    <div
                        key={groupIndex}
                        className="flex items-center gap-1 border-r border-slate-200 pr-2 last:border-r-0 dark:border-gray-700"
                    >
                        {group.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={`${item.command}-${item.label}`}
                                    type="button"
                                    title={item.label}
                                    aria-label={item.label}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => runCommand(item.command, item.value)}
                                    className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-white hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    <Icon className="h-4 w-4" />
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div
                ref={editorRef}
                role="textbox"
                aria-multiline="true"
                contentEditable
                suppressContentEditableWarning
                onInput={emitChange}
                onBlur={() => {
                    setIsFocused(false);
                    emitChange();
                }}
                onFocus={() => setIsFocused(true)}
                className={`${minHeightClassName} rich-text-editor ui-scrollbar overflow-y-auto px-4 py-3 text-sm leading-6 text-slate-800 outline-none dark:text-gray-100`}
            />
        </div>
    );
}
