import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Missing coupon code or user ID." },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    // Look up the coupon
    const couponRef = doc(db, "coupons", trimmedCode);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      return NextResponse.json(
        { error: "Invalid coupon code. Please check and try again." },
        { status: 404 }
      );
    }

    const coupon = couponSnap.data();

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json(
        { error: "This coupon has expired or been deactivated." },
        { status: 400 }
      );
    }

    // Check max uses
    const usedBy = coupon.usedBy || [];
    if (coupon.maxUses && usedBy.length >= coupon.maxUses) {
      return NextResponse.json(
        { error: "This coupon has already been fully redeemed." },
        { status: 400 }
      );
    }

    // Check if this user already used this coupon
    if (usedBy.includes(userId)) {
      return NextResponse.json(
        { error: "You have already redeemed this coupon." },
        { status: 400 }
      );
    }

    // Validate user exists
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Apply the coupon based on type
    const updateData = {};
    let successMessage = "";

    if (coupon.type === "credits") {
      const creditsToAdd = coupon.creditsToAdd || 0;
      updateData.credits = increment(creditsToAdd);
      successMessage = `🎉 ${creditsToAdd} credits added to your account!`;
    } else if (coupon.type === "unlimited") {
      const planDays = coupon.planDays || 30;
      const now = new Date();
      const expiry = new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000);
      updateData.plan = "unlimited";
      updateData.planExpiry = expiry.toISOString();
      successMessage = `🎉 Unlimited plan activated for ${planDays} days!`;
    } else {
      return NextResponse.json(
        { error: "Invalid coupon type." },
        { status: 400 }
      );
    }

    // Update user doc
    await updateDoc(userRef, updateData);

    // Mark coupon as used by this user
    await updateDoc(couponRef, {
      usedBy: arrayUnion(userId),
    });

    return NextResponse.json({
      success: true,
      message: successMessage,
      type: coupon.type,
      creditsAdded: coupon.type === "credits" ? coupon.creditsToAdd : undefined,
      planDays: coupon.type === "unlimited" ? coupon.planDays : undefined,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
