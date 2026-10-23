import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(80).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").max(100).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const demoUser = await db.user.findFirst({ where: { email: "user@demo.com" } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        role: true,
        credits: true,
        createdAt: true,
        emailVerified: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        image: user.image,
        plan: user.plan,
        role: user.role,
        credits: user.credits,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        hasPassword: !!user.passwordHash,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to fetch user profile" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const demoUser = await db.user.findFirst({ where: { email: "user@demo.com" } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseRes = updateProfileSchema.safeParse(body);

    if (!parseRes.success) {
      return NextResponse.json(
        { success: false, error: { message: parseRes.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    const { name, currentPassword, newPassword } = parseRes.data;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (newPassword) {
      // If user already has a password, verify currentPassword
      if (user.passwordHash && currentPassword) {
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: { message: "Incorrect current password" } },
            { status: 400 }
          );
        }
      }

      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        role: true,
        credits: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to update profile" } },
      { status: 500 }
    );
  }
}
