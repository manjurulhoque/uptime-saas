import Link from "next/link";
import Nav from "@/components/layout/Nav";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navigation */}
            <Nav />

            {/* Hero Section */}
            <main className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Monitor Your Websites
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Like a Pro
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Get instant alerts when your websites go down. Track
                            uptime, response times, and performance metrics with
                            our powerful monitoring platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Start Free Trial
                            </Link>
                            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Illustration */}
                    <div className="mt-16 flex justify-center">
                        <div className="w-full max-w-4xl">
                            <svg
                                viewBox="0 0 800 400"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-auto"
                            >
                                {/* Main dashboard */}
                                <rect
                                    x="50"
                                    y="80"
                                    width="700"
                                    height="280"
                                    rx="12"
                                    fill="white"
                                    stroke="#E5E7EB"
                                    strokeWidth="2"
                                />
                                <rect
                                    x="70"
                                    y="100"
                                    width="660"
                                    height="40"
                                    rx="6"
                                    fill="#F8FAFC"
                                />

                                {/* Header elements */}
                                <rect
                                    x="90"
                                    y="110"
                                    width="120"
                                    height="20"
                                    rx="4"
                                    fill="#3B82F6"
                                />
                                <rect
                                    x="230"
                                    y="110"
                                    width="80"
                                    height="20"
                                    rx="4"
                                    fill="#10B981"
                                />
                                <rect
                                    x="330"
                                    y="110"
                                    width="100"
                                    height="20"
                                    rx="4"
                                    fill="#F59E0B"
                                />

                                {/* Status cards */}
                                <rect
                                    x="90"
                                    y="160"
                                    width="150"
                                    height="80"
                                    rx="8"
                                    fill="#F8FAFC"
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                />
                                <rect
                                    x="260"
                                    y="160"
                                    width="150"
                                    height="80"
                                    rx="8"
                                    fill="#F8FAFC"
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                />
                                <rect
                                    x="430"
                                    y="160"
                                    width="150"
                                    height="80"
                                    rx="8"
                                    fill="#F8FAFC"
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                />
                                <rect
                                    x="600"
                                    y="160"
                                    width="120"
                                    height="80"
                                    rx="8"
                                    fill="#F8FAFC"
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                />

                                {/* Status indicators */}
                                <circle
                                    cx="110"
                                    cy="180"
                                    r="6"
                                    fill="#10B981"
                                />
                                <text
                                    x="130"
                                    y="185"
                                    fontSize="14"
                                    fill="#374151"
                                    fontWeight="600"
                                >
                                    Online
                                </text>
                                <text
                                    x="110"
                                    y="205"
                                    fontSize="24"
                                    fill="#10B981"
                                    fontWeight="bold"
                                >
                                    99.9%
                                </text>
                                <text
                                    x="110"
                                    y="225"
                                    fontSize="12"
                                    fill="#6B7280"
                                >
                                    Uptime
                                </text>

                                <circle
                                    cx="280"
                                    cy="180"
                                    r="6"
                                    fill="#EF4444"
                                />
                                <text
                                    x="300"
                                    y="185"
                                    fontSize="14"
                                    fill="#374151"
                                    fontWeight="600"
                                >
                                    Offline
                                </text>
                                <text
                                    x="280"
                                    y="205"
                                    fontSize="24"
                                    fill="#EF4444"
                                    fontWeight="bold"
                                >
                                    0.1%
                                </text>
                                <text
                                    x="280"
                                    y="225"
                                    fontSize="12"
                                    fill="#6B7280"
                                >
                                    Downtime
                                </text>

                                <circle
                                    cx="450"
                                    cy="180"
                                    r="6"
                                    fill="#F59E0B"
                                />
                                <text
                                    x="470"
                                    y="185"
                                    fontSize="14"
                                    fill="#374151"
                                    fontWeight="600"
                                >
                                    Warning
                                </text>
                                <text
                                    x="450"
                                    y="205"
                                    fontSize="24"
                                    fill="#F59E0B"
                                    fontWeight="bold"
                                >
                                    245ms
                                </text>
                                <text
                                    x="450"
                                    y="225"
                                    fontSize="12"
                                    fill="#6B7280"
                                >
                                    Avg Response
                                </text>

                                <circle
                                    cx="620"
                                    cy="180"
                                    r="6"
                                    fill="#3B82F6"
                                />
                                <text
                                    x="640"
                                    y="185"
                                    fontSize="14"
                                    fill="#374151"
                                    fontWeight="600"
                                >
                                    Active
                                </text>
                                <text
                                    x="620"
                                    y="205"
                                    fontSize="24"
                                    fill="#3B82F6"
                                    fontWeight="bold"
                                >
                                    12
                                </text>
                                <text
                                    x="620"
                                    y="225"
                                    fontSize="12"
                                    fill="#6B7280"
                                >
                                    Monitors
                                </text>

                                {/* Chart area */}
                                <rect
                                    x="90"
                                    y="260"
                                    width="620"
                                    height="80"
                                    rx="6"
                                    fill="#F8FAFC"
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                />

                                {/* Chart lines */}
                                <path
                                    d="M110 320 L150 300 L190 310 L230 290 L270 295 L310 280 L350 285 L390 270 L430 275 L470 260 L510 265 L550 250 L590 255 L630 240 L670 245 L710 230"
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                    fill="none"
                                />
                                <path
                                    d="M110 330 L150 320 L190 325 L230 315 L270 320 L310 310 L350 315 L390 305 L430 310 L470 300 L510 305 L550 295 L590 300 L630 290 L670 295 L710 285"
                                    stroke="#10B981"
                                    strokeWidth="2"
                                    fill="none"
                                />

                                {/* Floating elements */}
                                <circle
                                    cx="100"
                                    cy="50"
                                    r="4"
                                    fill="#3B82F6"
                                    opacity="0.6"
                                />
                                <circle
                                    cx="700"
                                    cy="60"
                                    r="3"
                                    fill="#10B981"
                                    opacity="0.6"
                                />
                                <circle
                                    cx="750"
                                    cy="30"
                                    r="5"
                                    fill="#F59E0B"
                                    opacity="0.6"
                                />
                                <circle
                                    cx="50"
                                    cy="350"
                                    r="3"
                                    fill="#EF4444"
                                    opacity="0.6"
                                />
                                <circle
                                    cx="750"
                                    cy="380"
                                    r="4"
                                    fill="#8B5CF6"
                                    opacity="0.6"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Everything you need to monitor your websites
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our comprehensive monitoring platform provides
                                real-time insights, instant alerts, and detailed
                                analytics to keep your websites running
                                smoothly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Real-time Monitoring
                                </h3>
                                <p className="text-gray-600">
                                    Get instant notifications when your websites
                                    go down or experience issues.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Fast Response Times
                                </h3>
                                <p className="text-gray-600">
                                    Monitor response times and performance
                                    metrics to ensure optimal user experience.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Detailed Analytics
                                </h3>
                                <p className="text-gray-600">
                                    Comprehensive reports and insights to help
                                    you understand your website performance.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Instant Alerts
                                </h3>
                                <p className="text-gray-600">
                                    Receive notifications via email, SMS, or
                                    webhook when issues are detected.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Secure & Reliable
                                </h3>
                                <p className="text-gray-600">
                                    Enterprise-grade security and 99.9% uptime
                                    guarantee for your monitoring needs.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Easy Setup
                                </h3>
                                <p className="text-gray-600">
                                    Get started in minutes with our simple setup
                                    process and intuitive dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses who trust UptimeSaaS to
                            monitor their websites and applications.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Start Free Trial
                            </Link>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h6a1 1 0 100-2H5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold">
                                    UptimeSaaS
                                </span>
                            </div>
                            <p className="text-gray-400">
                                Professional website monitoring and uptime
                                tracking for businesses of all sizes.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Product
                            </h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        API
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Integrations
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Company
                            </h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Support
                            </h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Status
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Community
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>
                            &copy; {new Date().getFullYear()} UptimeSaaS. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
