"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function MembershipSetup() {
  const [productName, setProductName] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!productName.trim()) {
      toast.error("Enter a product name first");
      return;
    }
    // TODO: persist to DB
    setSaved(true);
    toast.success("Membership product name saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Membership Product Name</CardTitle>
        <CardDescription>
          This is the product name that appears in your members&apos; confirmation emails. We&apos;ll match it against uploaded receipts to verify membership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="product-name">Product name</Label>
          <Input
            id="product-name"
            placeholder="e.g. Annual Membership 2025"
            value={productName}
            onChange={(e) => { setProductName(e.target.value); setSaved(false); }}
          />
          <p className="text-xs text-muted-foreground">
            Must match exactly how it appears in the member&apos;s receipt email.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saved || !productName.trim()}>
          {saved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
