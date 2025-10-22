"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Copy, Check } from "lucide-react";

type Props = {
    phones: string[];
    emails: string[];
    address: string;
};

function CopyButton({ value, ariaLabel }: { value: string; ariaLabel: string }) {
    const [copied, setCopied] = useState(false);

    async function onCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // noop
        }
    }

    return (
        <button
            type="button"
            onClick={onCopy}
            aria-label={ariaLabel}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-gray-700 "
        >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : ""}</span>
        </button>
    );
}

export function ContactList({ phones, emails, address }: Props) {
    return (
        <ul className="space-y-6">
            {/* Phones */}
            <li className="flex items-start gap-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-gray-700">
                    <Phone className="h-10 w-10" />
                </span>
                <div className="flex-1 space-y-2">
                    {phones.map((p) => {
                        const tel = p.replace(/\s+/g, "");
                        return (
                            <div key={p} className="flex items-center justify-between gap-3">
                                <a href={`tel:${tel}`} className="font-medium select-text text-gray-900">
                                    {p}
                                </a>
                                <CopyButton value={p} ariaLabel="Copy phone number" />
                            </div>
                        );
                    })}
                </div>
            </li>

            {/* Emails */}
            <li className="flex items-start gap-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-gray-700">
                    <Mail className="h-10 w-10" />
                </span>
                <div className="flex-1 space-y-2">
                    {emails.map((e) => (
                        <div key={e} className="flex items-center justify-between gap-3">
                            <a href={`mailto:${e}`} className="font-medium select-text break-all text-gray-900">
                                {e}
                            </a>
                            <CopyButton value={e} ariaLabel="Copy email" />
                        </div>
                    ))}
                </div>
            </li>

            {/* Address */}
            <li className="flex items-start gap-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-gray-700">
                    <MapPin className="h-10 w-10" />
                </span>
                <div className="text-sm leading-6 text-gray-800">
                    <div className="font-medium select-text">{address}</div>
                </div>
            </li>
        </ul>
    );
}