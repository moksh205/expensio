# ⚙️ Backend Setup Guide (Supabase)

This project uses Supabase as the backend for authentication and database management.

Follow the steps below to configure the backend correctly.

---

## 🚀 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait until setup completes

---

## 🔑 2. Get API Keys

Go to:

Settings → API

Copy:
- Project URL
- Anon Public Key

Create a `.env` file:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

---

## 🗄️ 3. Create Database Table

Table Name: expenses

Columns:
- id (uuid, primary key, default: gen_random_uuid())
- amount (numeric)
- category (text)
- note (text, optional)
- created_at (timestamp, default: now())
- user_id (uuid)

---

## 🔒 4. Enable Row Level Security (RLS)

Enable RLS for the expenses table.

---

## 🛡️ 5. Add Security Policies

SELECT:
CREATE POLICY "Read own expenses"
ON public.expenses
FOR SELECT
USING (auth.uid() = user_id);

INSERT:
CREATE POLICY "Insert own expenses"
ON public.expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DELETE:
CREATE POLICY "Delete own expenses"
ON public.expenses
FOR DELETE
USING (auth.uid() = user_id);

---

## ⚠️ IMPORTANT

Always send user_id from frontend:

await supabase.from("expenses").insert({
  amount,
  category,
  note,
  user_id: user.id
});

---

## ⚡ 6. Add Index

CREATE INDEX idx_user_id ON expenses(user_id);

---

## 🔐 7. Authentication

Enable Email/Password (and optional Google login)

---

## 🧪 8. Test

- Add expense
- Verify user-specific data

---

🔥 Backend setup complete.
