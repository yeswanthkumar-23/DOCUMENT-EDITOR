-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '<p></p>',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT FALSE
);

-- Create document_collaborators table for sharing
CREATE TABLE IF NOT EXISTS document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('read', 'write', 'admin')) DEFAULT 'write',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Create document_sessions table for real-time presence
CREATE TABLE IF NOT EXISTS document_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_position JSONB,
  is_typing BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_document_sessions_document_id ON document_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_sessions_user_id ON document_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view documents they created or have access to" ON documents
  FOR SELECT USING (
    created_by = auth.uid() OR 
    is_public = TRUE OR
    id IN (
      SELECT document_id FROM document_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own documents" ON documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update documents they created or have write access to" ON documents
  FOR UPDATE USING (
    created_by = auth.uid() OR
    id IN (
      SELECT document_id FROM document_collaborators 
      WHERE user_id = auth.uid() AND permission IN ('write', 'admin')
    )
  );

CREATE POLICY "Users can delete documents they created" ON documents
  FOR DELETE USING (created_by = auth.uid());

-- Create policies for document_collaborators
CREATE POLICY "Users can view collaborators for documents they have access to" ON document_collaborators
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR 
            is_public = TRUE OR
            id IN (SELECT document_id FROM document_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Document owners can manage collaborators" ON document_collaborators
  FOR ALL USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    )
  );

-- Create policies for document_sessions
CREATE POLICY "Users can manage their own sessions" ON document_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view sessions for documents they have access to" ON document_sessions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR 
            is_public = TRUE OR
            id IN (SELECT document_id FROM document_collaborators WHERE user_id = auth.uid())
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
