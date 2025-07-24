import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { wallet_address } = await request.json();
    console.log('Received wallet_address:', wallet_address);

    if (!wallet_address) {
      console.log('Missing wallet address');
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log('Checking if user exists...');
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    console.log('Check user result:', { existingUser, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return NextResponse.json(
        { error: "Failed to check user" },
        { status: 500 }
      );
    }

    // If user exists, return existing user
    if (existingUser) {
      console.log('User already exists, returning:', existingUser);
      return NextResponse.json({ user: existingUser }, { status: 200 });
    }

    console.log('Creating new user...');
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ wallet_address }])
      .select()
      .single();

    console.log('Create user result:', { newUser, createError });

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    console.log('User created successfully:', newUser);
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get('wallet_address');

    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
