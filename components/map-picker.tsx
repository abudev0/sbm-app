"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { LatLngLiteral } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then(m => m.Marker),       { ssr: false });

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapPickerProps = {
  open: boolean;
  onClose: () => void;
  // address — ixtiyoriy (agar reverse geocode muvaffaqiyatli bo‘lsa)
  onSelect: (pos: { lat: number; lng: number; label: string; address?: string }) => void;
  initial?: LatLngLiteral;
};

const DEFAULT_CENTER: LatLngLiteral = { lat: 41.311081, lng: 69.240562 };

export default function MapPicker({ open, onClose, onSelect, initial }: MapPickerProps) {
  const t = useTranslations("MapPicker");

  const [pos, setPos] = useState<LatLngLiteral | null>(initial ?? null);
  const [center, setCenter] = useState<LatLngLiteral>(initial ?? DEFAULT_CENTER);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!("geolocation" in navigator)) return;

    let cancelled = false;
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (res) => {
        if (cancelled) return;
        const here = { lat: res.coords.latitude, lng: res.coords.longitude };
        setPos(here);
        setCenter(here);
        setLocating(false);
      },
      (err) => {
        if (cancelled) return;
        setGeoError(err?.message || "Geolocation error");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    return () => { cancelled = true; };
  }, [open]);

  // Map click listener — React Leaflet hook’ini ichkarida chaqiramiz
  function ClickHandler() {
    const { useMapEvents } = require("react-leaflet");
    useMapEvents({
      click(e: any) {
        setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  const locateMe = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (res) => {
        const here = { lat: res.coords.latitude, lng: res.coords.longitude };
        setPos(here);
        setCenter(here);
        setLocating(false);
      },
      (err) => {
        setGeoError(err?.message || "Geolocation error");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Reverse geocoding: OSM Nominatim
  async function reverseGeocode(lat: number, lon: number) {
    try {
      setResolving(true);
      const lang = navigator.language || "uz";
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}&accept-language=${encodeURIComponent(lang)}`;
      const resp = await fetch(url, {
        headers: {
          // Nominatim odob-axloq talabi: o‘zingizning sahifa / email qo‘ying
          "User-Agent": "sbm.uz checkout (contact: info@sbm.uz)"
        }
      });
      const data = await resp.json();
      // foydali maydonlarni yig‘amiz
      const nice =
        data?.display_name ||
        [
          data?.address?.road,
          data?.address?.house_number,
          data?.address?.suburb,
          data?.address?.city || data?.address?.town || data?.address?.village,
          data?.address?.state,
          data?.address?.country
        ]
          .filter(Boolean)
          .join(", ");
      return (nice || "").trim() || undefined;
    } catch {
      return undefined;
    } finally {
      setResolving(false);
    }
  }

  const coordLabel = pos ? `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}` : "";

  return open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button className="absolute inset-0 bg-black/50" onClick={onClose} aria-label={t("close")} />
      <div className="relative z-[101] w-[95vw] max-w-[880px] rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold text-lg">{t("title")}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={locateMe}
              className="text-sm text-neutral-700 hover:text-neutral-900 rounded-lg border px-2 py-1"
              aria-busy={locating}
            >
              {locating ? (t("locating") || "Joy aniqlanmoqda…") : (t("locateMe") || "Mening joyim")}
            </button>
            <button onClick={onClose} className="text-sm text-neutral-600 hover:text-neutral-900">
              {t("close")}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="h-[60vh] w-full overflow-hidden rounded-xl border">
            <MapContainer center={center} zoom={12} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler />
              {pos && <Marker position={pos} icon={markerIcon} />}
            </MapContainer>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-neutral-600">
              {pos ? (
                <>
                  {t("selectedPoint")}:{" "}
                  <span className="font-medium text-neutral-900">{coordLabel}</span>
                </>
              ) : (
                t("clickHint")
              )}
              {geoError && (
                <div className="mt-1 text-[12px] text-red-600">
                  {t("geoError") || "Geolokatsiyaga ruxsat berilmadi yoki aniqlanmadi."}
                </div>
              )}
            </div>

            <button
              disabled={!pos || resolving}
              onClick={async () => {
                if (!pos) return;
                const addr = await reverseGeocode(pos.lat, pos.lng);
                onSelect({ lat: pos.lat, lng: pos.lng, label: coordLabel, address: addr });
                onClose();
              }}
              className={`rounded-xl px-4 py-2 text-white transition ${
                pos && !resolving ? "bg-neutral-900 hover:bg-black" : "bg-neutral-400 cursor-not-allowed"
              }`}
              aria-disabled={!pos || resolving}
            >
              {resolving ? (t("resolving") || "Manzil aniqlanmoqda…") : t("confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
