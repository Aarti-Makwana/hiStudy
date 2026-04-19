import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { course_id, review, rating } = body || {};

    if (!course_id || !review || !rating) {
      return NextResponse.json(
        {
          status: "error",
          success: false,
          message: "course_id, review, and rating are required fields.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        success: true,
        message: "Review submitted successfully.",
        data: {
          course_id,
          review,
          rating,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        success: false,
        message: "Unable to parse request body.",
      },
      { status: 400 }
    );
  }
}
