"use client";

import { useState } from "react";

type Props = {
    phonePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
    successLabel: string;
    errorLabel: string;
};

export function ContactForm({
    phonePlaceholder,
    emailPlaceholder,
    messagePlaceholder,
    submitLabel,
    successLabel,
    errorLabel,
}: Props) {
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");

        try {
            // TODO: Agar backend endpoint bo‘lsa shu yerda fetch qiling
            await new Promise((res) => setTimeout(res, 800));
            setStatus("success");
            setPhone("");
            setEmail("");
            setMessage("");
        } catch {
            setStatus("error");
        } finally {
            setTimeout(() => setStatus("idle"), 2500);
        }
    }

    return (
        <form
            onSubmit={onSubmit}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="phone" className="sr-only">
                        {phonePlaceholder}
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder={phonePlaceholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-black bg-inherit px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-300"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="sr-only">
                        {emailPlaceholder}
                    </label>
                    <input
                        id="email"
                        type="email"
                        inputMode="email"
                        placeholder={emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-black bg-inherit px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-300"
                        required
                    />
                </div>
            </div>

            <div className="mt-3">
                <label htmlFor="message" className="sr-only">
                    {messagePlaceholder}
                </label>
                <textarea
                    id="message"
                    placeholder={messagePlaceholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[160px] w-full rounded-xl border border-black bg-inherit px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-300"
                    required
                />
            </div>

            <div className="mt-4 flex items-center gap-3 w-full">
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-black/90 disabled:opacity-60 w-full"
                >
                    {status === "loading" ? "..." : submitLabel}
                </button>

                {status === "success" && (
                    <p className="text-sm text-green-600">{successLabel}</p>
                )}
                {status === "error" && (
                    <p className="text-sm text-red-600">{errorLabel}</p>
                )}
            </div>
        </form>
    );
}