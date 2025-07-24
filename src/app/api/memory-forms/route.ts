import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { title, description, owners, photos, created_by } = await request.json();

    if (!title || !created_by) {
      return NextResponse.json(
        { error: "Title and created_by are required" },
        { status: 400 }
      );
    }

    // Start a transaction to create form, owners, and photos
    const { data: form, error: formError } = await supabase
      .from('memory_forms')
      .insert([{
        title,
        description,
        created_by
      }])
      .select()
      .single();

    if (formError) {
      console.error('Error creating form:', formError);
      return NextResponse.json(
        { error: "Failed to create memory form" },
        { status: 500 }
      );
    }

    // Add form owners
    if (owners && owners.length > 0) {
      const ownerData = owners.map((wallet_address: string) => ({
        form_id: form.id,
        wallet_address
      }));

      const { error: ownersError } = await supabase
        .from('form_owners')
        .insert(ownerData);

      if (ownersError) {
        console.error('Error creating form owners:', ownersError);
        // Continue anyway, owners can be added later
      }
    }

    // Add photos
    if (photos && photos.length > 0) {
      const photoData = photos.map((photo: { url: string; cid: string; fileName: string; fileSize: number; mimeType: string }) => ({
        form_id: form.id,
        pinata_url: photo.url,
        pinata_cid: photo.cid,
        file_name: photo.fileName,
        file_size: photo.fileSize,
        mime_type: photo.mimeType
      }));

      const { error: photosError } = await supabase
        .from('photos')
        .insert(photoData);

      if (photosError) {
        console.error('Error creating photos:', photosError);
        // Continue anyway, photos can be added later
      }
    }

    // Fetch the complete form with related data
    const { data: completeForm, error: fetchError } = await supabase
      .from('memory_forms')
      .select(`
        *,
        photos (*),
        form_owners (*),
        users (*)
      `)
      .eq('id', form.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete form:', fetchError);
      return NextResponse.json({ form }, { status: 201 });
    }

    return NextResponse.json({ form: completeForm }, { status: 201 });
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
    const created_by = searchParams.get('created_by');
    const wallet_address = searchParams.get('wallet_address');

    let query = supabase
      .from('memory_forms')
      .select(`
        *,
        photos (*),
        form_owners (*),
        users (*)
      `);

    if (created_by) {
      query = query.eq('created_by', created_by);
    } else if (wallet_address) {
      // Find forms where user is either creator or owner
      // First get the user ID for this wallet address
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', wallet_address)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ forms: [] }, { status: 200 });
      }

      // Get forms created by this user OR where they are an owner
      const { data: createdForms, error: createdError } = await supabase
        .from('memory_forms')
        .select(`
          *,
          photos (*),
          form_owners (*),
          users (*)
        `)
        .eq('created_by', userData.id);

      const { data: ownedFormIds, error: ownedError } = await supabase
        .from('form_owners')
        .select('form_id')
        .eq('wallet_address', wallet_address);

      if (createdError && ownedError) {
        console.error('Error fetching forms:', { createdError, ownedError });
        return NextResponse.json(
          { error: "Failed to fetch memory forms" },
          { status: 500 }
        );
      }

      let allForms = createdForms || [];

      // If user is owner of additional forms, fetch those too
      if (ownedFormIds && ownedFormIds.length > 0) {
        const ownedFormIdList = ownedFormIds.map(item => item.form_id);
        const { data: ownedForms, error: ownedFormsError } = await supabase
          .from('memory_forms')
          .select(`
            *,
            photos (*),
            form_owners (*),
            users (*)
          `)
          .in('id', ownedFormIdList);

        if (!ownedFormsError && ownedForms) {
          // Merge and deduplicate forms
          const createdFormIds = new Set(allForms.map(form => form.id));
          const uniqueOwnedForms = ownedForms.filter(form => !createdFormIds.has(form.id));
          allForms = [...allForms, ...uniqueOwnedForms];
        }
      }

      // Sort by created_at descending
      allForms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json({ forms: allForms }, { status: 200 });
    } else {
      // If no filters, get all forms (for admin or public view)
      const { data: forms, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching forms:', error);
        return NextResponse.json(
          { error: "Failed to fetch memory forms" },
          { status: 500 }
        );
      }

      return NextResponse.json({ forms }, { status: 200 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 