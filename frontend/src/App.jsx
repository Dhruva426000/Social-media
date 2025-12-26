export default function App() {
  return (
    <div data-theme="light" className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="navbar bg-base-200 px-4">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Social-Media 🚀</a>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary">Login</button>
          <button className="btn btn-secondary">Sign Up</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero bg-base-100 flex-grow">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome!</h1>
            <p className="py-6">
              Build your social media platform with Tailwind + DaisyUI. Fast,
              themeable, and beautiful.
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-base-200 p-4 text-base-content">
        <div className="items-center grid-flow-col">
          <p>© 2025 Social-Media Platform</p>
        </div>
      </footer>
    </div>
  );
}
