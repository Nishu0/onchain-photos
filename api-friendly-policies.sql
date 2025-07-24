-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can view forms they created or own" ON memory_forms;
DROP POLICY IF EXISTS "Users can create forms" ON memory_forms;
DROP POLICY IF EXISTS "Users can update own forms" ON memory_forms;
DROP POLICY IF EXISTS "Users can view form owners" ON form_owners;
DROP POLICY IF EXISTS "Users can add form owners to their forms" ON form_owners;
DROP POLICY IF EXISTS "Users can view photos from accessible forms" ON photos;
DROP POLICY IF EXISTS "Users can add photos to their forms" ON photos;

-- Create API-friendly policies (more permissive for development)
CREATE POLICY "Allow API access to users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow API access to memory_forms" ON memory_forms
  FOR ALL USING (true);

CREATE POLICY "Allow API access to form_owners" ON form_owners
  FOR ALL USING (true);

CREATE POLICY "Allow API access to photos" ON photos
  FOR ALL USING (true);

-- Note: In production, you should create more specific policies based on your auth system 