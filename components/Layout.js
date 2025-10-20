// components/Layout.js
import Header from './Header';
import TopNavBar from './TopNavBar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <TopNavBar />
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}