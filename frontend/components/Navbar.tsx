// // Sidebar.tsx
// 'use client'; // Required because this component uses client-side hooks like useState and usePathname

// import React, { useState } from 'react';
// import Link from 'next/link'; // Import Link from next/link
// import { usePathname } from 'next/navigation'; // Import usePathname for path access
// import {
//     Menu,
//     X,
//     Gamepad2,
//     Home,
//     LogOut,
//     Ghost,
//     LogIn
// } from 'lucide-react';

// // --- Placeholder for useAuth Hook ---
// // You MUST replace this mock with your actual client-side implementation of useAuth.
// // Ensure your actual AuthContext/useAuth hook is defined in a client component or hook.
// interface User {
//     email: string;
// }

// interface AuthContextType {
//     user: User | null;
//     logout: () => void;
// }

// // Mock implementation for conversion purposes:
// const useAuth = (): AuthContextType => {
//     // Replace with your real user state and logout function from your context
//     const [user] = useState<User | null>({ email: 'john.doe@example.com' });
//     const logout = () => {
//         console.log('User logged out (Next.js implementation)');
//         // Add your actual state clear/API call here
//     };
//     return { user, logout };
// };
// // ------------------------------------


// export default function Sidebar() {
//     const { user, logout } = useAuth();
//     const pathname = usePathname(); // Next.js equivalent of useLocation().pathname
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//     // Don't show sidebar on login/register pages
//     if (pathname === '/login' || pathname === '/register') {
//         return null;
//     }

//     const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
//     const closeMobileMenu = () => setIsMobileMenuOpen(false);

//     const isActive = (path: string) => pathname === path;

//     // Use 'href' instead of 'to' and 'Link' from 'next/link'
//     const NavItem = ({ href, icon: Icon, label, colorClass = "group-hover:text-white" }: any) => (
//         <Link
//             href={href} // CHANGED: 'to' is now 'href'
//             onClick={closeMobileMenu}
//             className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
//         ${isActive(href)
//                     ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20'
//                     : 'text-slate-400 hover:bg-slate-800/50'
//                 }`}
//         >
//             <Icon
//                 size={20}
//                 className={`transition-colors duration-200 ${isActive(href) ? 'text-cyan-400' : colorClass}`}
//             />
//             <span className={`font-medium ${isActive(href) ? 'text-cyan-50' : 'text-slate-400 group-hover:text-slate-200'}`}>
//                 {label}
//             </span>
//             {isActive(href) && (
//                 <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
//             )}
//         </Link>
//     );

//     return (
//         <>
//             {/* Mobile Top Bar - Transparent with Floating Controls */}
//             <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-end px-4 pointer-events-none">

//                 <button
//                     onClick={toggleMobileMenu}
//                     className="p-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 backdrop-blur-md rounded-lg transition-all shadow-lg pointer-events-auto"
//                 >
//                     {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//                 </button>
//             </div>

//             {/* Mobile Backdrop */}
//             {isMobileMenuOpen && (
//                 <div
//                     className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
//                     onClick={closeMobileMenu}
//                 />
//             )}

//             {/* Sidebar Container */}
//             <aside className={`
//         fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-700/50 
//         transition-transform duration-300 ease-in-out
//         ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
//         md:translate-x-0 md:flex flex-col
//       `}>
//                 {/* Desktop Header */}
//                 <div className="hidden md:flex items-center gap-3 px-6 h-20 border-b border-slate-800/50">
//                     <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
//                         <span className="text-white font-bold text-lg">DT</span>
//                     </div>
//                     <div className="flex flex-col">
//                         <span className="text-white font-bold text-lg tracking-tight">Dichoptic</span>
//                         <span className="text-slate-500 text-xs font-medium tracking-wider uppercase">Training</span>
//                     </div>
//                 </div>

//                 {/* Navigation Content */}
//                 <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
//                     <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">Menu</div>

//                     <NavItem href="/" icon={Home} label="Dashboard" colorClass="group-hover:text-cyan-400" />

//                     <div className="mt-6 text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">Games</div>

//                     <NavItem href="/tetris" icon={Gamepad2} label="Tetris" colorClass="group-hover:text-cyan-400" />
//                     <NavItem href="/snake" icon={Ghost} label="Snake" colorClass="group-hover:text-pink-400" />
//                 </div>

//                 {/* User Footer */}
//                 <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
//                     {user ? (
//                         <div className="flex flex-col gap-3">
//                             <div className="flex items-center gap-3 px-2">
//                                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-800">
//                                     {user.email.substring(0, 2).toUpperCase()}
//                                 </div>
//                                 <div className="flex flex-col overflow-hidden">
//                                     <span className="text-sm font-medium text-slate-200 truncate">{user.email}</span>
//                                     <span className="text-xs text-slate-500">Free Account</span>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => {
//                                     logout();
//                                     closeMobileMenu();
//                                 }}
//                                 className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-1 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
//                             >
//                                 <LogOut size={16} />
//                                 <span>Sign Out</span>
//                             </button>
//                         </div>
//                     ) : (
//                         <Link
//                             href="/login" // CHANGED: 'to' is now 'href'
//                             onClick={closeMobileMenu}
//                             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white text-sm font-semibold transition-all shadow-lg shadow-purple-900/20"
//                         >
//                             <LogIn size={18} />
//                             <span>Login / Register</span>
//                         </Link>
//                     )}
//                 </div>
//             </aside>
//         </>
//     );
// }
// Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    Gamepad2,
    Home,
    LogOut,
    Ghost,
    LogIn,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// --- Placeholder for useAuth Hook (Keep as is) ---
interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    logout: () => void;
}

const useAuth = (): AuthContextType => {
    const [user] = useState<User | null>({ email: 'john.doe@example.com' });
    const logout = () => {
        console.log('User logged out (Next.js implementation)');
    };
    return { user, logout };
};
// --------------------------------------------------


export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // State for desktop collapse functionality (starts collapsed)
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Don't show sidebar on login/register pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const isActive = (path: string) => pathname === path;

    // NEW LOGIC: Determine the effective collapsed state for content rendering.
    // Content is expanded (false) if mobile menu is open OR if desktop is explicitly uncollapsed.
    // Content is collapsed (true) only on desktop when the user has not uncollapsed it.
    const isContentCollapsed = isMobileMenuOpen ? false : isCollapsed;


    // NavItem component uses the new isContentCollapsed state
    const NavItem = ({ href, icon: Icon, label, colorClass = "group-hover:text-white" }: any) => (
        <Link
            href={href}
            onClick={closeMobileMenu}
            // MODIFIED: Use isContentCollapsed
            className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group
        ${isContentCollapsed ? 'justify-center p-3' : 'px-4 py-3'} 
        ${isActive(href)
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
        >
            <Icon
                size={20}
                className={`transition-colors duration-200 ${isActive(href) ? 'text-cyan-400' : colorClass}`}
            />
            {/* CONDITIONAL RENDERING: Hide label when collapsed */}
            {!isContentCollapsed && (
                <span className={`font-medium ${isActive(href) ? 'text-cyan-50' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {label}
                </span>
            )}
            {/* CONDITIONAL RENDERING: Adjust active dot positioning */}
            {isActive(href) && !isContentCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            )}
        </Link>
    );

    return (
        <>
            {/* Mobile Top Bar (No change) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-end px-4 pointer-events-none">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 backdrop-blur-md rounded-lg transition-all shadow-lg pointer-events-auto"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Backdrop (No change) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full bg-slate-900 border-r border-slate-700/50 
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:flex flex-col
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        // MOBILE WIDTH FIX: Ensure mobile sidebar is always wide (w-64) when open.
        ${isMobileMenuOpen ? 'w-64' : ''} 
      `}>
                {/* Desktop Header */}
                <div className={`hidden md:flex items-center gap-3 h-20 border-b border-slate-800/50 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
                    {/* Logo/Icon */}
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <span className="text-white font-bold text-lg">DT</span>
                    </div>
                    {/* Title (Hidden when collapsed) */}
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg tracking-tight">Dichoptic</span>
                            <span className="text-slate-500 text-xs font-medium tracking-wider uppercase">Training</span>
                        </div>
                    )}
                    {/* Collapse Toggle Button - ONLY visible on desktop (md:flex) */}
                    <button
                        onClick={toggleCollapse}
                        className={`hidden md:flex absolute top-4 
                            ${isCollapsed ? 'right-0 -mr-4' : 'right-0 -mr-4'} 
                            w-8 h-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg z-10`}
                        aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Mobile Header (New: Visible on mobile only for branding) */}
                <div className="md:hidden flex items-center gap-3 px-6 h-16 border-b border-slate-800/50">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <span className="text-white font-bold text-lg">DT</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight">Dichoptic</span>
                    </div>
                </div>

                {/* Navigation Content */}
                {/* MODIFIED: Use isContentCollapsed for padding */}
                <div className={`flex-1 overflow-y-auto py-6 flex flex-col gap-1 transition-all duration-300 ${isContentCollapsed ? 'px-3' : 'px-4'}`}>

                    {/* Section Headers (Hidden when content is collapsed) */}
                    {!isContentCollapsed && (
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">Menu</div>
                    )}

                    <NavItem href="/" icon={Home} label="Dashboard" colorClass="group-hover:text-cyan-400" />

                    {!isContentCollapsed && (
                        <div className="mt-6 text-xs font-semibold text-slate-500 mb-2 px-4 uppercase tracking-wider">Games</div>
                    )}

                    <NavItem href="/tetris" icon={Gamepad2} label="Tetris" colorClass="group-hover:text-cyan-400" />
                    <NavItem href="/snake" icon={Ghost} label="Snake" colorClass="group-hover:text-pink-400" />
                </div>

                {/* User Footer */}
                {/* MODIFIED: Use isContentCollapsed for padding */}
                <div className={`border-t border-slate-800/50 bg-slate-900/50 transition-all duration-300 ${isContentCollapsed ? 'p-3' : 'p-4'}`}>
                    {user ? (
                        // User Info (Conditional classes for collapse)
                        <div className="flex flex-col gap-3">
                            {/* MODIFIED: Use isContentCollapsed for centering/padding */}
                            <div className={`flex items-center gap-3 ${isContentCollapsed ? 'justify-center' : 'px-2'}`}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-800">
                                    {user.email.substring(0, 2).toUpperCase()}
                                </div>
                                {/* Text Info (Hidden when content is collapsed) */}
                                {!isContentCollapsed && (
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-slate-200 truncate">{user.email}</span>
                                        <span className="text-xs text-slate-500">Free Account</span>
                                    </div>
                                )}
                            </div>
                            {/* Sign Out Button (Adjusted styling for collapse) */}
                            <button
                                onClick={() => {
                                    logout();
                                    closeMobileMenu();
                                }}
                                className={`flex items-center justify-center w-full px-4 py-2 mt-1 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors
                                    ${isContentCollapsed ? 'w-full' : 'gap-2'}
                                `}
                            >
                                <LogOut size={16} />
                                {/* Label (Hidden when content is collapsed) */}
                                {!isContentCollapsed && <span>Sign Out</span>}
                            </button>
                        </div>
                    ) : (
                        // Login/Register Button (Adjusted styling for collapse)
                        <Link
                            href="/login"
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white text-sm font-semibold transition-all shadow-lg shadow-purple-900/20
                                ${isContentCollapsed ? 'px-3' : 'px-4 gap-2'}
                            `}
                        >
                            <LogIn size={18} />
                            {!isContentCollapsed && <span>Login / Register</span>}
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}