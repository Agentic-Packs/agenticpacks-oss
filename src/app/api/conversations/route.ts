import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paginationQuerySchema, createConversationSchema } from "@/lib/validation/conversation.schema";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const demoUser = await db.user.findFirst({ where: { email: "user@demo.com" } });
      userId = demoUser?.id || "demo-user";
    }

    const { searchParams } = new URL(req.url);
    const parseRes = paginationQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    const { page, limit } = parseRes.success ? parseRes.data : { page: 1, limit: 20 };
    const skip = (page - 1) * limit;

    const [total, conversations] = await Promise.all([
      db.conversation.count({ where: { userId } }),
      db.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { content: true, role: true, createdAt: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations.map((c) => ({
          id: c.id,
          title: c.title,
          model: "gpt-4o-mini",
          messageCount: c._count.messages,
          lastMessage: c.messages[0] || null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to fetch conversations" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const parseRes = createConversationSchema.safeParse(body);
    const { title = "New Chat" } = parseRes.success ? parseRes.data : {};

    const conversation = await db.conversation.create({
      data: {
        userId,
        title,
      },
    });

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to create conversation" } },
      { status: 500 }
    );
  }
}
