import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paginationQuerySchema, updateConversationSchema } from "@/lib/validation/conversation.schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const demoUser = await db.user.findFirst({ where: { email: "user@demo.com" } });
      userId = demoUser?.id || "demo-user";
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { message: "Conversation not found" } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parseRes = paginationQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
    });

    const { page, limit } = parseRes.success ? parseRes.data : { page: 1, limit: 50 };
    const skip = (page - 1) * limit;

    const [totalMessages, messages] = await Promise.all([
      db.message.count({ where: { conversationId } }),
      db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        conversation,
        messages,
        pagination: {
          total: totalMessages,
          page,
          limit,
          totalPages: Math.ceil(totalMessages / limit) || 1,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to fetch conversation" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
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
    const parseRes = updateConversationSchema.safeParse(body);

    if (!parseRes.success) {
      return NextResponse.json(
        { success: false, error: { message: parseRes.error.issues[0]?.message || "Invalid title" } },
        { status: 400 }
      );
    }

    const updated = await db.conversation.updateMany({
      where: { id: conversationId, userId },
      data: { title: parseRes.data.title.trim() },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Conversation not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: conversationId, title: parseRes.data.title.trim() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to update conversation" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const demoUser = await db.user.findFirst({ where: { email: "user@demo.com" } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const deleted = await db.conversation.deleteMany({
      where: { id: conversationId, userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Conversation not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deletedId: conversationId },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to delete conversation" } },
      { status: 500 }
    );
  }
}
