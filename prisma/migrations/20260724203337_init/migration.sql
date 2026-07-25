-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('TEXT', 'FILE', 'URL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ANALYZING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "user_provide_prompts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "prompt" TEXT,
    "input_type" "PromptType" NOT NULL DEFAULT 'TEXT',
    "original_file_name" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "source_url" TEXT,
    "extracted_text" TEXT,
    "normalized_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_provide_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt_id" TEXT,
    "title" VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_reports" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "issues" JSONB,
    "suggestions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarification_questions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clarification_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_provide_prompts_user_id_idx" ON "user_provide_prompts"("user_id");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_prompt_id_idx" ON "projects"("prompt_id");

-- CreateIndex
CREATE INDEX "qa_reports_project_id_idx" ON "qa_reports"("project_id");

-- CreateIndex
CREATE INDEX "clarification_questions_project_id_idx" ON "clarification_questions"("project_id");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- AddForeignKey
ALTER TABLE "user_provide_prompts" ADD CONSTRAINT "user_provide_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "user_provide_prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_reports" ADD CONSTRAINT "qa_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarification_questions" ADD CONSTRAINT "clarification_questions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
