// pages/_app.js

import '../styles/globals.css';
import { AppProvider } from '../context/AppContext';
import 'react-datepicker/dist/react-datepicker.css';
import { Inter } from 'next/font/google';

// 2. Konfigurasi font
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

function MyApp({ Component, pageProps }) {
    return (
        <main className={`${inter.variable} font-sans`}>
            <AppProvider>
                <Component {...pageProps} />
            </AppProvider>
    </main>
    );
}

export default MyApp;