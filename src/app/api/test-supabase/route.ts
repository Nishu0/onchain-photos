import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Test 1: Check if users table exists
    console.log('Checking if users table exists...');
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    console.log('Users table check:', { usersCheck, usersError });

    if (usersError) {
      return NextResponse.json(
        { 
          error: "Users table doesn't exist or has permission issues", 
          details: usersError,
          suggestion: "Run the SQL commands from database-schema.sql in your Supabase SQL Editor"
        },
        { status: 500 }
      );
    }

    // Test 2: Try to insert a test user
    console.log('Testing user insertion...');
    const testWallet = `test_${Date.now()}`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([{ wallet_address: testWallet }])
      .select()
      .single();

    console.log('Insert test result:', { insertData, insertError });

    if (insertError) {
      return NextResponse.json(
        { 
          error: "Cannot insert user", 
          details: insertError,
          tablesExist: true,
          suggestion: "Check RLS policies or table permissions"
        },
        { status: 500 }
      );
    }

    // Test 3: Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('wallet_address', testWallet);

    // Test 4: Check other tables
    const tableTests = await Promise.all([
      supabase.from('memory_forms').select('*').limit(1),
      supabase.from('form_owners').select('*').limit(1),
      supabase.from('photos').select('*').limit(1)
    ]);

    const [memoryFormsResult, formOwnersResult, photosResult] = tableTests;

    return NextResponse.json({ 
      message: "All tests passed!",
      tables: {
        users: !usersError,
        memory_forms: !memoryFormsResult.error,
        form_owners: !formOwnersResult.error,
        photos: !photosResult.error
      },
      insertTest: "SUCCESS",
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    }, { status: 200 });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
      },
      { status: 500 }
    );
  }
} 