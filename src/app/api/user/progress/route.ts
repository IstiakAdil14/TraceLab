import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET user stats, progress, XP, and achievements
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({
        user: null,
        progress: [],
        achievements: [],
        stats: { totalXp: 0, level: 1, completedCount: 0 },
      });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          include: { lesson: true },
        },
        achievements: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const completedCount = user.progress.filter((p) => p.completed).length;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        xp: user.xp,
        level: user.level,
      },
      progress: user.progress,
      achievements: user.achievements,
      stats: {
        totalXp: user.xp,
        level: user.level,
        completedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST update lesson progress and award XP / achievements
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { lessonSlug, completed, quizPassed, score } = await request.json();

    if (!lessonSlug) {
      return NextResponse.json({ error: "Lesson slug required" }, { status: 400 });
    }

    // Find or create lesson
    let lesson = await prisma.lesson.findUnique({
      where: { slug: lessonSlug },
    });

    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          slug: lessonSlug,
          title: lessonSlug.replace(/-/g, " ").toUpperCase(),
          category: "Algorithms",
          explanation: "Algorithm visualization lesson",
          code: "// Code example",
          xpReward: 50,
        },
      });
    }

    // Upsert progress
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
    });

    const isNewlyCompleted = !existingProgress?.completed && completed;
    const xpToAdd = isNewlyCompleted ? lesson.xpReward : 0;

    const updatedProgress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
      create: {
        userId,
        lessonId: lesson.id,
        completed: !!completed,
        quizPassed: !!quizPassed,
        score: score ?? 100,
      },
      update: {
        completed: completed !== undefined ? completed : existingProgress?.completed,
        quizPassed: quizPassed !== undefined ? quizPassed : existingProgress?.quizPassed,
        score: score !== undefined ? Math.max(score, existingProgress?.score ?? 0) : existingProgress?.score,
      },
    });

    // Update User XP & level if newly completed
    let updatedUser = null;
    if (xpToAdd > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + xpToAdd;
        const newLevel = Math.floor(newXp / 100) + 1;
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            xp: newXp,
            level: newLevel,
          },
        });

        // Award achievement for first completion
        const completedCount = await prisma.progress.count({
          where: { userId, completed: true },
        });

        if (completedCount === 1) {
          await prisma.achievement.create({
            data: {
              userId,
              title: "First Step",
              description: "Completed your first algorithm tracing lesson!",
              badgeIcon: "Zap",
            },
          });
        } else if (completedCount === 5) {
          await prisma.achievement.create({
            data: {
              userId,
              title: "Algorithm Explorer",
              description: "Completed 5 algorithm lessons!",
              badgeIcon: "Trophy",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      xpGained: xpToAdd,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
