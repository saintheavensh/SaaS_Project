import { jsx as _jsx } from "react/jsx-runtime";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
    title: "Admin Super-Portal",
    description: "Internal System Management",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { className: inter.className, children: _jsx(AuthProvider, { children: children }) }) }));
}
