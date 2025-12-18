# The Alpha Ones CRM

A Customer Relationship Management (CRM) application built for TheAlphaOnes.

## ✨ Features

*   **Dashboard:** Centralized view for managing customer data.
*   **Email Integration:** Send and track emails to clients.
*   **User Management:** Add and manage users in the system.
*   **Authentication:** Secure login using Supabase Auth.
*   **Responsive Design:** UI that works on both desktop and mobile devices.

## 🚀 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
*   **Authentication:** [Supabase Auth](https://supabase.com/docs/guides/auth)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 📦 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/installation) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd the-alpha-ones-crm
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
    ```npm install drizzle-orm postgres```
    ```npm install @supabase/supabase-js @supabase/ssr```

3.  **Set up environment variables:**
    
    Create a `.env.local` file in the root of your project and add the following variables. You can get these from your Supabase project settings.

    ```env
    DATABASE_URL="your_supabase_connection_string"
    NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
    ```

4.  **Push database schema:**

    Apply the Drizzle schema to your Supabase database.

    ```bash
    pnpm drizzle-kit push
    ```

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

The main application code is located in the `src/` directory.

```
src/
├── app/          # Next.js App Router pages and layouts
│   ├── (auth)/   # Authentication related pages
│   ├── (dashboard)/ # Dashboard pages and layout
│   ├── action/   # Server actions
│   └── ...
├── components/   # Reusable React components
│   └── ui/       # Shadcn/ui components
├── db/           # Drizzle ORM schema and configuration
├── lib/          # Utility functions
└── utils/        # Supabase client and server utilities
```


 
