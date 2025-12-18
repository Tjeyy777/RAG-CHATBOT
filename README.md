# 📁 Multimodal File-Chat RAG Chatbot

A high-performance "Chat with your files" application. This platform allows users to upload documents (PDF, TXT, DOCX) and images (PNG, JPG), store them in cloud object storage, and interact with an AI assistant that provides answers **strictly grounded** in the uploaded content.

## 📺 Project Demo
> **[https://drive.google.com/file/d/1nUNTmz-U1AzGm1k6wNAZQeB0CiSNjceK/view?usp=sharing]** *(Update this with your Loom/Drive link)*

---

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authorization:** Secure login and registration flow.
- **Strict User Isolation:** Users can only access, manage, and chat with their own uploaded assets.
- **Environment Safety:** Private keys and credentials are managed via `.env` (excluded from version control).

### 📂 Asset Management
- **Multimodal Support:** - **Documents:** Text extraction and recursive chunking for PDFs, TXT, and DOCX.
    - **Images:** Vision-integrated RAG using GPT-4o-mini to analyze and index visual content.
- **Cloud Storage:** Files are hosted on **Supabase Storage** (S3-compatible).
- **Synchronized Deletion:** Deleting an asset removes the file from cloud storage and purges all associated vector embeddings from the database.

### 🧠 RAG Architecture
- **Vector Search:** Uses **PostgreSQL with pgvector** for semantic similarity matching.
- **Embeddings:** Powered by OpenAI `text-embedding-3-small`.
- **Grounded Responses:** The AI is constrained to only answer based on retrieved context, providing source citations for every response.



---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Material UI (MUI) |
| **Backend** | Django, Django REST Framework (DRF) |
| **Database** | PostgreSQL + **pgvector** |
| **Storage** | **Supabase Storage** |
| **AI Engine** | OpenAI (GPT-4o-mini & Text-Embeddings-3-Small) |

---

## 🏗️ Technical Implementation

### The Ingestion Flow
1. **Upload:** User sends a file; it is streamed to Supabase Storage.
2. **Processing:**
   - **Text:** Extracted and split into 1000-character chunks with overlap.
   - **Images:** Analyzed via GPT-4o-mini Vision to generate a descriptive text representation.
3. **Vectorization:** Content is converted into 1536-dimensional vectors.
4. **Indexing:** Vectors are stored in `pgvector` tagged with `user_id` and `asset_id`.



## 🏗️ System Architecture
![Project Architecture](./archtecture.svg)

---

## ⚙️ Installation & Setup


```bash
1. Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

2. Frontend Setup (React)
cd frontend/frontend
npm install
npm start

3. Environment Variables (.env)
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgresql_url

