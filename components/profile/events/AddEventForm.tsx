"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/TextArea";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Globe,
  ImagePlus,
  Layers,
  PencilLine,
} from "lucide-react";
import {
  EVENT_CATEGORIES,
  EventCategory,
  EventPricing,
  EventLocationType,
} from "@/types/events/event";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventBody } from "@/lib/schemas/api/events";
import { uploadEventThumbnail } from "@/lib/supabase/storage";
import { toast } from "sonner";

interface AddEventFormProps {
  onSubmit: (event: Omit<CreateEventBody, "id">) => Promise<void> | void;
  onCancel: () => void;
  initialValues?: Partial<Omit<CreateEventBody, "id">>;
  submitLabel?: string;
  source?: string;
}

const SECTION_CARD =
  "w-full rounded-[22px] border-2 bg-white p-5 shadow-sm border-[color:var(--theme-border)]";
const SECTION_LABEL =
  "inline-flex items-center rounded-full bg-[color:var(--theme-200)] px-4 py-1.5 text-base font-semibold text-slate-700";
const ICON_BUTTON =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 text-slate-400 transition-colors hover:text-slate-600";
const CHIP_BASE =
  "inline-flex items-center rounded-full border px-4 py-1.5 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

type ThemePreset = {
  id: string;
  name: string;
  swatch: string;
  main: string;
  tint100: string;
  tint200: string;
  border: string;
};

const TIMEZONE_OPTIONS = [
  { offset: "GMT+08:00", city: "Perth" },
  { offset: "GMT+09:30", city: "Darwin" },
  { offset: "GMT+09:30", city: "Adelaide" },
  { offset: "GMT+10:00", city: "Brisbane" },
  { offset: "GMT+10:00", city: "Canberra" },
  { offset: "GMT+10:00", city: "Melbourne" },
  { offset: "GMT+10:00", city: "Sydney" },
  { offset: "GMT+10:00", city: "Hobart" },
];

export default function AddEventForm({
  onSubmit,
  onCancel,
  initialValues,
  submitLabel = "Add Event",
  source,
}: AddEventFormProps) {
  const { user, profile } = useAuthStore();
  const [name, setName] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<EventCategory[]>([]);
  const [collaborators] = useState<{ id: string; name: string }[]>([]);
  const [bookingLink, setBookingLink] = useState<string>("");
  const [pricingMin, setPricingMin] = useState<string>("");
  const [pricingMax, setPricingMax] = useState<string>("");
  const [pricingCurrency, setPricingCurrency] = useState<string>("AUD");
  const [locationVenue, setLocationVenue] = useState<string>("");
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationCity, setLocationCity] = useState<string>("");
  const [locationCountry, setLocationCountry] = useState<string>("");
  const [locationType, setLocationType] =
    useState<EventLocationType>("physical");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [accentColor, setAccentColor] = useState<string>("#6F63FF");
  const [timezone, setTimezone] = useState(
    TIMEZONE_OPTIONS.find((option) => option.city === "Melbourne") ??
      TIMEZONE_OPTIONS[0]
  );
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onCancel();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    const toDateInputValue = (value?: Date | string | null) => {
      if (!value) return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 10);
    };

    const toTimeInputValue = (value?: Date | string | null) => {
      if (!value) return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().slice(11, 16);
    };

    setName(initialValues.name ?? "");
    setDescription(initialValues.description ?? "");
    setStart(toDateInputValue(initialValues.start));
    setEnd(toDateInputValue(initialValues.end));
    setStartTime(toTimeInputValue(initialValues.start));
    setEndTime(toTimeInputValue(initialValues.end));
    setType(initialValues.type ?? []);
    setBookingLink(
      initialValues.booking_link?.[0] ?? ""
    );
    setLocationType(initialValues.location_type ?? "physical");
    setLocationVenue(initialValues.location?.venue ?? "");
    setLocationAddress(initialValues.location?.address ?? "");
    setLocationCity(
      initialValues.location?.city ?? initialValues.city?.[0] ?? ""
    );
    setLocationCountry(initialValues.location?.country ?? "");
    setPricingMin(
      initialValues.pricing_min != null
        ? String(initialValues.pricing_min)
        : ""
    );
    setPricingMax(
      initialValues.pricing_max != null
        ? String(initialValues.pricing_max)
        : ""
    );
    setPricingCurrency(initialValues.currency ?? "");
    if (initialValues.thumbnailUrl) {
      setThumbnailPreview(initialValues.thumbnailUrl);
    }
  }, [initialValues]);

  const categories = EVENT_CATEGORIES;

  const themePresets: ThemePreset[] = [
    {
      id: "teal",
      name: "Teal",
      swatch: "#73DFC7",
      main: "#73DFC7",
      tint100: "#DDF6F0",
      tint200: "#C9F0E7",
      border: "#B4E9DD",
    },
    {
      id: "purple",
      name: "Purple",
      swatch: "#7878FF",
      main: "#7878FF",
      tint100: "#EEE9FF",
      tint200: "#E0D7FF",
      border: "#C9BCFF",
    },
    {
      id: "pink",
      name: "Pink",
      swatch: "#F090AA",
      main: "#F090AA",
      tint100: "#FDE3EE",
      tint200: "#F7C2D9",
      border: "#EFB0CC",
    },
    {
      id: "yellow",
      name: "Yellow",
      swatch: "#EEC869",
      main: "#EEC869",
      tint100: "#FFE7BF",
      tint200: "#FFDCA1",
      border: "#F5D08A",
    },
    {
      id: "blue",
      name: "Blue",
      swatch: "#6AB6ED",
      main: "#6AB6ED",
      tint100: "#DCEEFF",
      tint200: "#C6E2FF",
      border: "#AED6FF",
    },
    {
      id: "lilac",
      name: "Lilac",
      swatch: "#C0C0E0",
      main: "#C0C0E0",
      tint100: "#E7E8FF",
      tint200: "#D7D9FF",
      border: "#C7C8FF",
    },
  ];

  const currentTheme =
    themePresets.find((theme) => theme.swatch === accentColor) ??
    themePresets[1];

  const isOrganisation = profile?.account_type === "organisation";

  const handleTypeChange = (category: EventCategory, checked: boolean) => {
    if (isOrganisation) {
      setType(checked ? [category] : []);
    } else {
      if (checked) {
        setType([...type, category]);
      } else {
        setType(type.filter((t) => t !== category));
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }
    setThumbnailFile(file);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setThumbnailPreview(nextUrl);
  };

  if (!user) return null;

  const isCategoriesEmpty = type.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        return;
      }
      const pricingMinValue = Number(pricingMin || 0);
      const pricingMaxValue = Number(pricingMax || 0);
      const derivedPricing: EventPricing =
        pricingMinValue > 0 || pricingMaxValue > 0 ? "paid" : "free";
      const bookingLinkValues = bookingLink.trim()
        ? [bookingLink.trim()]
        : [];
      const trimmedCurrency = pricingCurrency.trim().toUpperCase();
      const locationPayload = {
        venue: locationVenue.trim() || null,
        address: locationAddress.trim() || null,
        city: locationCity.trim() || null,
        country: locationCountry.trim() || null,
      };
      const cityList = locationPayload.city ? [locationPayload.city] : [];
      const resolvedThumbnail =
        thumbnailPreview && !thumbnailPreview.startsWith("blob:")
          ? thumbnailPreview
          : undefined;
      let uploadedThumbnailUrl = resolvedThumbnail;
      if (thumbnailFile) {
        const uploadResult = await uploadEventThumbnail(thumbnailFile);
        if (!uploadResult.success || !uploadResult.url) {
          toast.error("Failed to upload event image");
          return;
        }
        uploadedThumbnailUrl = uploadResult.url;
      }
      const eventData: Omit<CreateEventBody, "id"> = {
        creator_profile_id: user.id,
        name,
        start: new Date(`${start}T${startTime}`),
        end: new Date(`${end}T${endTime}`),
        description,
        type,
        collaborators: collaborators.map((c) => c.id),
        booking_link: bookingLinkValues,
        pricing: derivedPricing,
        pricing_min: Number.isFinite(pricingMinValue) ? pricingMinValue : 0,
        pricing_max: Number.isFinite(pricingMaxValue) ? pricingMaxValue : 0,
        currency: trimmedCurrency.length === 3 ? trimmedCurrency : undefined,
        city: cityList,
        location_type: locationType,
        location: locationPayload,
        thumbnailUrl: uploadedThumbnailUrl,
        source: source ?? undefined,
        university: profile?.university
          ? [profile.university]
          : undefined,
      };
      await onSubmit(eventData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-6xl px-8 py-6"
      style={
        {
          "--theme": currentTheme.main,
          "--theme-100": currentTheme.tint100,
          "--theme-200": currentTheme.tint200,
          "--theme-border": currentTheme.border,
        } as React.CSSProperties
      }
    >
      <div className="grid w-full gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="relative w-full max-w-[320px] overflow-visible">
            <label className="group relative flex aspect-[4/5] w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="absolute inset-0 overflow-hidden rounded-2xl bg-black">
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
                    alt="Event poster preview"
                    fill
                    sizes="(max-width: 1024px) 320px, 320px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="sr-only">Add photo</span>
                )}
                <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md">
                  <ImagePlus className="h-4 w-4 text-slate-500" />
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleThumbnailChange}
                disabled={isSubmitting}
              />
            </label>
          </div>
          <div className="mt-4 flex w-full max-w-[320px] items-center justify-center gap-3">
            {themePresets.map((theme) => {
              const isSelected = accentColor === theme.swatch;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setAccentColor(theme.swatch)}
                  className={`relative aspect-square rounded-full border-[4px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition ${
                    isSelected ? "h-12 w-12" : "h-11 w-11"
                  }`}
                  style={{ backgroundColor: theme.swatch }}
                  aria-label={`Select ${theme.name} theme`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-6">
          <div>
            <Label htmlFor="name" className="sr-only">
              Event Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Event Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-auto border-0 bg-transparent px-0 !text-[38px] font-semibold leading-tight text-slate-900 placeholder:!text-[38px] placeholder:text-slate-300 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className={SECTION_CARD}>
            <div className="flex items-start justify-between gap-4">
              <span className={SECTION_LABEL}>Description</span>
              <div className="flex items-center gap-2">
                <AiEnhanceDialog
                  initialText={description}
                  fieldType="event_description"
                  title="Enhance event description"
                  assistantIntro="Tell me what you want this description to emphasise, and I'll refine it."
                  onApply={setDescription}
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Edit description"
                >
                  <PencilLine className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Textarea
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              value={description}
              placeholder="Add a description ..."
              className="mt-3 min-h-[56px] border-0 bg-transparent px-0 text-base text-slate-500 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className={SECTION_CARD}>
            <div className="flex items-start justify-between gap-4">
              <span className={SECTION_LABEL}>Duration</span>
            </div>
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
              {/* Adjust the first column width to move the dotted line left/right (e.g. 22px -> 20px). */}
              <div className="grid w-full max-w-none grid-cols-[19px_1fr] grid-rows-[20px_32px_20px] items-center text-base text-slate-600 md:max-w-[200px]">
                <span className="col-start-1 row-start-1 flex h-5 w-full items-center justify-center">
                  <span className="h-3 w-3 rounded-full bg-[color:var(--theme)]" />
                </span>
                <span className="col-start-2 row-start-1 text-slate-900">Start</span>
                <span className="col-start-1 row-start-2 flex h-full items-center justify-center">
                  <span className="h-full w-0 border-l-2 border-dotted border-[color:var(--theme)]" />
                </span>
                <span className="col-start-1 row-start-3 flex h-5 w-full items-center justify-center">
                  <span className="h-3 w-3 rounded-full border-2 border-[color:var(--theme)] bg-white" />
                </span>
                <span className="col-start-2 row-start-3 text-slate-900">End</span>
              </div>
              <div className="flex w-full max-w-none flex-col gap-4 md:max-w-[560px]">
                <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
                  <Input
                    id="start"
                    type="date"
                    placeholder="Tue 6 Jan"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-11 flex-[0_1_190px] rounded-[14px] border-2 border-[color:var(--theme)] bg-[color:var(--theme-100)] px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
                  />
                  <Input
                    id="startTime"
                    type="time"
                    placeholder="5:30 pm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-11 flex-[0_1_140px] rounded-[14px] border-2 border-[color:var(--theme)] bg-[color:var(--theme-100)] px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
                  <Input
                    id="end"
                    type="date"
                    placeholder="Tue 6 Jan"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-11 flex-[0_1_190px] rounded-[14px] border-2 border-[color:var(--theme)] bg-[color:var(--theme-100)] px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
                  />
                  <Input
                    id="endTime"
                    type="time"
                    placeholder="6:30 pm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-11 flex-[0_1_140px] rounded-[14px] border-2 border-[color:var(--theme)] bg-[color:var(--theme-100)] px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className="flex w-full max-w-none justify-center lg:ml-auto lg:w-[1200px] lg:max-w-[1200px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-[color:var(--theme)] bg-[color:var(--theme-100)] p-5 text-center text-base text-slate-500 transition-colors hover:bg-[color:var(--theme-200)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--theme)]"
                      aria-label="Select GMT offset"
                    >
                      <Globe className="h-5 w-5 text-slate-500" />
                      <div className="text-lg font-semibold text-slate-900">
                        {timezone.offset}
                      </div>
                      <div className="text-base text-slate-500">
                        {timezone.city}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {TIMEZONE_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={`${option.offset}-${option.city}`}
                        onClick={() => setTimezone(option)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {option.offset}
                          </span>
                          <span className="text-xs text-slate-500">
                            {option.city}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className={`${SECTION_CARD}`}>
            <div className="flex items-start justify-between gap-4">
              <span className={SECTION_LABEL}>Pricing</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px]">
              <Input
                id="pricing-min"
                type="number"
                min={0}
                placeholder="Min"
                value={pricingMin}
                onChange={(e) => setPricingMin(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
              />
              <Input
                id="pricing-max"
                type="number"
                min={0}
                placeholder="Max"
                value={pricingMax}
                onChange={(e) => setPricingMax(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
              />
              <Input
                id="pricing-currency"
                placeholder="AUD"
                value={pricingCurrency}
                onChange={(e) =>
                  setPricingCurrency(e.target.value.toUpperCase())
                }
                maxLength={3}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Leave min/max as 0 for free events.
            </p>
          </div>

          <div className={`${SECTION_CARD}`}>
            <div className="flex items-start justify-between gap-4">
              <span className={SECTION_LABEL}>Location</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                id="location-venue"
                placeholder="Venue (optional)"
                value={locationVenue}
                onChange={(e) => setLocationVenue(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
              />
              <Input
                id="location-city"
                placeholder="City (optional)"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
              />
              <Input
                id="location-address"
                placeholder="Address (optional)"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0 sm:col-span-2"
              />
              <Input
                id="location-country"
                placeholder="Country (optional)"
                value={locationCountry}
                onChange={(e) => setLocationCountry(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <div className={SECTION_CARD}>
            <Label
              htmlFor="booking-link"
              className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-700"
            >
              <Globe className="h-4 w-4 text-slate-500" />
              Booking link
            </Label>
            <Input
              id="booking-link"
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={bookingLink}
              onChange={(e) => setBookingLink(e.target.value)}
              disabled={isSubmitting}
              className="h-11 rounded-[14px] border-2 border-slate-200/70 px-4 text-base text-slate-600 shadow-none focus-visible:ring-0"
            />
            <p className="mt-1.5 text-sm text-slate-500">
              Optional. Add a ticket or registration URL.
            </p>
          </div>

          <div className={`${SECTION_CARD} group min-h-[112px]`}>
            <div className="flex items-start justify-between gap-4">
              <span className={SECTION_LABEL}>Category</span>
              {!isCategoriesEmpty && (
                <button
                  type="button"
                  className={`${ICON_BUTTON} h-8 w-8`}
                  aria-label="Edit category"
                >
                  <PencilLine className="h-4 w-4" />
                </button>
              )}
            </div>
            {isCategoriesEmpty ? (
              <button
                type="button"
                className="mt-3 flex items-center gap-3 rounded-lg px-2 py-1 text-base font-normal text-slate-400 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--theme-200)]"
              >
                <Layers className="h-5 w-5 text-slate-400" />
                <span>
                  {isOrganisation ? "Select category ..." : "Add a category ..."}
                </span>
              </button>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {type.map((category) => (
                  <span
                    key={category}
                    className={`${CHIP_BASE} border-[color:var(--theme-200)] bg-[color:var(--theme-100)] text-slate-700`}
                  >
                    {category.replace("-", " ")}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 hidden flex-wrap gap-2 group-focus-within:flex">
              {categories.map((category) => {
                const isSelected = type.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleTypeChange(category, !isSelected)}
                    className={`${CHIP_BASE} ${
                      isSelected
                        ? "border-[color:var(--theme-200)] bg-[color:var(--theme-100)] text-slate-700"
                        : "border-slate-200/70 text-slate-400 hover:border-[color:var(--theme-200)] hover:text-slate-600"
                    }`}
                    disabled={isSubmitting}
                    aria-pressed={isSelected}
                  >
                    {category.replace("-", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex w-full flex-wrap gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 border border-[color:var(--theme)] bg-[color:var(--theme)] px-5 text-white hover:bg-[color:var(--theme)]/90"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 border-[color:var(--theme-200)] bg-white px-5 text-slate-500 hover:bg-[color:var(--theme-100)]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
