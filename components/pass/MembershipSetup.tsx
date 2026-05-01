"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

type VerifiedMember = {
  id: string;
  verified_email: string;
  matched_product_name: string;
  verified_at: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export default function MembershipSetup() {
  const profile = useAuthStore((state) => state.profile);
  const [productName, setProductName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [members, setMembers] = useState<VerifiedMember[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  const loadMembershipProduct = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${profile.id}/membership-product`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to load membership setup");
      }

      setProductName(body.data?.product?.product_name ?? "");
      setEnabled(body.data?.product?.enabled ?? true);
      setMembers(body.data?.members ?? []);
      setMemberCount(body.data?.memberCount ?? 0);
      setSaved(Boolean(body.data?.product?.product_name));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load membership setup",
      );
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadMembershipProduct();
  }, [loadMembershipProduct]);

  const handleSave = async () => {
    if (!profile?.id) {
      toast.error("Organisation profile not loaded yet");
      return;
    }
    if (!productName.trim()) {
      toast.error("Enter a product name first");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/clubs/${profile.id}/membership-product`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName,
          enabled,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to save membership setup");
      }

      setProductName(body.data.product_name ?? productName);
      setEnabled(body.data.enabled ?? enabled);
      setSaved(true);
      toast.success("Membership product name saved");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save membership setup",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Membership Product Name</CardTitle>
        <CardDescription>
          This is the product name that appears in your members&apos;
          confirmation emails. We&apos;ll match it against uploaded receipts to
          verify membership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="product-name">Product name</Label>
          <Input
            id="product-name"
            placeholder="e.g. Annual Membership 2025"
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value);
              setSaved(false);
            }}
            disabled={loading || saving}
          />
          <p className="text-xs text-muted-foreground">
            Must match exactly how it appears in the member&apos;s receipt
            email.
          </p>
        </div>
        {memberCount > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Verified members</p>
              <span className="text-xs text-muted-foreground">
                {memberCount} total
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {members.slice(0, 5).map((member) => {
                const name = [
                  member.profile?.first_name,
                  member.profile?.last_name,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">
                      {name || member.verified_email}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(member.verified_at).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={loading || saving || saved || !productName.trim()}
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
