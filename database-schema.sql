-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory forms table (stores the form data)
CREATE TABLE memory_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form owners table (for multiple wallet addresses per form)
CREATE TABLE form_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES memory_forms(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, wallet_address)
);

-- Photos table (stores individual photos with Pinata URLs)
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES memory_forms(id) ON DELETE CASCADE,
  pinata_url TEXT NOT NULL,
  pinata_cid TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_memory_forms_created_by ON memory_forms(created_by);
CREATE INDEX idx_form_owners_form_id ON form_owners(form_id);
CREATE INDEX idx_form_owners_wallet_address ON form_owners(wallet_address);
CREATE INDEX idx_photos_form_id ON photos(form_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::TEXT = id::TEXT);

-- Memory forms policies
CREATE POLICY "Users can view forms they created or own" ON memory_forms
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT form_id FROM form_owners 
      WHERE wallet_address = (SELECT wallet_address FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create forms" ON memory_forms
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own forms" ON memory_forms
  FOR UPDATE USING (created_by = auth.uid());

-- Form owners policies
CREATE POLICY "Users can view form owners" ON form_owners
  FOR SELECT USING (
    form_id IN (
      SELECT id FROM memory_forms WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add form owners to their forms" ON form_owners
  FOR INSERT WITH CHECK (
    form_id IN (
      SELECT id FROM memory_forms WHERE created_by = auth.uid()
    )
  );

-- Photos policies
CREATE POLICY "Users can view photos from accessible forms" ON photos
  FOR SELECT USING (
    form_id IN (
      SELECT id FROM memory_forms 
      WHERE created_by = auth.uid() OR 
      id IN (
        SELECT form_id FROM form_owners 
        WHERE wallet_address = (SELECT wallet_address FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can add photos to their forms" ON photos
  FOR INSERT WITH CHECK (
    form_id IN (
      SELECT id FROM memory_forms WHERE created_by = auth.uid()
    )
  ); 