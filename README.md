# **Climdo – Next.js Todo Frontend**

🚀 A modern and powerful frontend for the **Climdo Task Management App**, built with **Next.js 14** and **TypeScript**, featuring a clean and responsive design powered by **TailwindCSS** and **ShadCN/UI**.
This project works seamlessly with the [Flask Todo API Backend](https://github.com/Ishaksmail/flask-todo-backend.git).

---

## ✨ **Features**

* ⚡ **High performance** with Next.js 14 (App Router).
* 🔐 **Full JWT authentication integration**.
* 📅 **Smart task organization** with prioritization and scheduling.
* 👥 **Group collaboration** for team-based task management.
* 🗑️ **Trash bin support** to recover deleted tasks.
* 🎨 **Modern and responsive UI** with TailwindCSS and ShadCN/UI.

---

## 📂 **Project Structure**

```
src/
│── app/
│   ├── page.tsx            # Redirects to /welcome
│   ├── welcome/            # Landing page
│   ├── login/              # Login page
│   ├── register/           # Sign-up page
│   ├── dashboard/          # Main task dashboard
│   ├── upcoming/           # Upcoming tasks page
│   ├── groups/             # Groups management page
│   ├── completed/          # Completed tasks page
│   └── trash/              # Deleted tasks page
│
│── components/             # Reusable UI components
│── hooks/                  # Context providers and custom hooks
│── lib/                    # Utility functions
│── types/                  # TypeScript type definitions
```

---

## ⚙️ **Installation and Setup**

### 1️⃣ **Clone the repository**

```bash
git clone https://github.com/Ishaksmail/nextjs_todo_frontend.git
cd nextjs_todo_frontend
```

### 2️⃣ **Install dependencies**

```bash
npm install
```

### 3️⃣ **Set up environment variables**

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Example:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4️⃣ **Run the development server**

```bash
npm run dev
```

The app will be available at:
🔗 **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 **Backend Integration**

This project is designed to work with the **Flask Todo API Backend**:
👉 [Flask Todo Backend Repository](https://github.com/Ishaksmail/flask-todo-backend.git)

---

## 🛠️ **Tech Stack**

* **Next.js 14 (App Router)**
* **TypeScript**
* **TailwindCSS + ShadCN/UI**
* **Axios** (for API requests)
* **GSAP** (for animations)

---

## 🤝 **Contributing**

Contributions are welcome!

* Create a feature branch: `feature/your-feature-name`
* Ensure code quality and proper testing before submitting a **Pull Request**.


