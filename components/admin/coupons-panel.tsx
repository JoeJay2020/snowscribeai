"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Loader2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  code: string;
  credits: number;
  active: boolean;
  archived?: boolean;
  expiresAt: string | null;
  totalRedemptions?: number;
  createdAt?: string;
}

type StatusFilter = "all" | "active" | "inactive" | "expired" | "archived";

export function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formCode, setFormCode] = useState("");
  const [formCredits, setFormCredits] = useState("50");
  const [formExpiry, setFormExpiry] = useState("");

  useEffect(() => {
    void refreshCoupons();
  }, []);

  async function refreshCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons((data.coupons ?? []) as Coupon[]);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  async function createCoupon() {
    if (!formCode.trim()) return;
    const credits = Number(formCredits);
    if (!Number.isFinite(credits) || credits <= 0) {
      setMessage("Credits must be a positive number.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const payload = {
        code: formCode.trim(),
        credits,
        expiresAt: formExpiry ? new Date(formExpiry).toISOString() : null,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setFormCode("");
      setFormCredits("50");
      setFormExpiry("");
      setMessage(`Coupon ${data.code} created.`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCoupon(coupon: Coupon) {
    if (coupon.archived) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          active: !coupon.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage(`Coupon ${coupon.code} ${coupon.active ? "deactivated" : "activated"}.`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCredits(coupon: Coupon, value: string) {
    if (coupon.archived) return;
    const credits = Number(value);
    if (!Number.isFinite(credits) || credits <= 0) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, credits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update credits");
      setMessage(`Coupon ${coupon.code} credits updated.`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update credits.");
    } finally {
      setSaving(false);
    }
  }

  async function updateExpiry(coupon: Coupon, value: string) {
    if (coupon.archived) return;
    setSaving(true);
    setMessage("");
    try {
      const expiresAt = value ? new Date(value).toISOString() : null;
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, expiresAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update expiry");
      setMessage(`Coupon ${coupon.code} expiry updated.`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update expiry.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveCoupon(coupon: Coupon) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, mode: "archive" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to archive coupon");
      setMessage(`Coupon ${coupon.code} archived.`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to archive coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function restoreCoupon(coupon: Coupon) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          archived: false,
          active: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore coupon");
      setMessage(`Coupon ${coupon.code} restored (inactive).`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to restore coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    const confirmed = window.confirm(
      `Delete coupon ${coupon.code} permanently? This cannot be undone.`
    );
    if (!confirmed) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, mode: "delete" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete coupon");
      setMessage(`Coupon ${coupon.code} deleted.`);
      await refreshCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete coupon.");
    } finally {
      setSaving(false);
    }
  }

  const filteredCoupons = useMemo(() => {
    const now = Date.now();

    return coupons.filter((coupon) => {
      const matchesSearch = coupon.code
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const isExpired = Boolean(
        coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now
      );
      const isArchived = Boolean(coupon.archived);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coupon.active && !isExpired && !isArchived) ||
        (statusFilter === "inactive" && !coupon.active && !isExpired && !isArchived) ||
        (statusFilter === "expired" && isExpired && !isArchived) ||
        (statusFilter === "archived" && isArchived);

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Coupon Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Code"
            placeholder="WELCOME50"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toUpperCase())}
          />
          <Input
            label="Credits"
            type="number"
            min={1}
            value={formCredits}
            onChange={(e) => setFormCredits(e.target.value)}
          />
          <Input
            label="Expiry (optional)"
            type="datetime-local"
            value={formExpiry}
            onChange={(e) => setFormExpiry(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={() => void createCoupon()} disabled={saving} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coupon code..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive", "expired", "archived"] as const).map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoupons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No coupons yet.</p>
            ) : (
              filteredCoupons.map((coupon) => {
                const isExpired = Boolean(
                  coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()
                );
                const expiry = coupon.expiresAt
                  ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
                  : "";
                return (
                  <div
                    key={coupon.code}
                    className="grid gap-3 rounded-lg border p-3 lg:grid-cols-[1.1fr_.7fr_1fr_auto_auto_auto_auto]"
                  >
                    <div>
                      <p className="font-medium">{coupon.code}</p>
                      <p className="text-xs text-muted-foreground">
                        Redemptions: {coupon.totalRedemptions ?? 0}
                      </p>
                    </div>

                    <Input
                      type="number"
                      min={1}
                      defaultValue={String(coupon.credits)}
                      disabled={coupon.archived}
                      onBlur={(e) => void updateCredits(coupon, e.target.value)}
                    />

                    <Input
                      type="datetime-local"
                      defaultValue={expiry}
                      disabled={coupon.archived}
                      onBlur={(e) => void updateExpiry(coupon, e.target.value)}
                    />

                    <Badge
                      variant={
                        coupon.archived
                          ? "secondary"
                          : isExpired
                            ? "destructive"
                            : coupon.active
                              ? "success"
                              : "secondary"
                      }
                    >
                      {coupon.archived
                        ? "Archived"
                        : isExpired
                          ? "Expired"
                          : coupon.active
                            ? "Active"
                            : "Inactive"}
                    </Badge>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={coupon.archived}
                      onClick={() => void toggleCoupon(coupon)}
                      aria-label={`Toggle ${coupon.code}`}
                    >
                      {coupon.active ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </Button>

                    {coupon.archived ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void restoreCoupon(coupon)}
                        aria-label={`Restore ${coupon.code}`}
                      >
                        <ArchiveRestore className="h-4 w-4 text-primary" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void archiveCoupon(coupon)}
                        aria-label={`Archive ${coupon.code}`}
                      >
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void deleteCoupon(coupon)}
                      aria-label={`Delete ${coupon.code}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
