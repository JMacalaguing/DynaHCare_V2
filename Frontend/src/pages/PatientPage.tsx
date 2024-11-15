import { Button } from "../Components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
        <title>Patient Healthcare Portal</title>
        <meta name="description" content="Patient Healthcare Portal" />

      <header className="border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="h-6 w-6"
              fill="black"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xl font-semibold text-black">Patient</span>
          </div>
          <div className="text-sm text-gray-600">July 22, 2024</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <a
            href="/child-care"
            className="flex h-32 items-center justify-center rounded-lg bg-[#00205B] p-6 text-center text-lg font-semibold text-white transition-transform hover:scale-105"
          >
            TCL For Child Care
          </a>
          <a
            href="/maternal-care"
            className="flex h-32 items-center justify-center rounded-lg bg-[#00205B] p-6 text-center text-lg font-semibold text-white transition-transform hover:scale-105"
          >
            TCL For Maternal Care
          </a>
          <a
            href="/tuberculosis-program"
            className="flex h-32 items-center justify-center rounded-lg bg-[#00205B] p-6 text-center text-lg font-semibold text-white transition-transform hover:scale-105"
          >
            TCL For National Tuberculosis Program
          </a>
        </div>
      </main>
    </div>
  )
}