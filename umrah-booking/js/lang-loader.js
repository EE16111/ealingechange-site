// Language Loader
// Version 1.0

const TRANSLATIONS = {
    'en': null, // Default
    'ur': {
        'nav_home': 'گھر',
        'nav_packages': 'پیکیجز',
        'nav_quote': 'فوری قیمت',
        'hero_title': 'کا سفر شروع کریں',
        'hero_subtitle': 'عمرہ پیکیجز صرف £899 سے شروع'
    },
    'ar': {
        'nav_home': 'الرئيسية',
        'nav_packages': 'باقات',
        'nav_quote': 'اقتباس فوري',
        'hero_title': 'رحلتك إلى الأراضي المقدسة تبدأ هنا',
        'hero_subtitle': 'باقات العمرة المميزة تبدأ من 899 جنيه إسترليني'
    }
};

class LangLoader {
    constructor() {
        this.currentLang = 'en';
        this.init();
    }

    init() {
        this.createSelector();
    }

    createSelector() {
        const nav = document.querySelector('nav div.flex'); // Target the flex container in nav
        if (!nav) return;

        const container = document.createElement('div');
        container.className = 'relative ml-4 group';
        container.innerHTML = `
            <button class="flex items-center gap-1 text-slate-700 font-bold hover:text-emerald-600">
                🌐 <span id="currentLangLabel">EN</span>
            </button>
            <div class="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-xl hidden group-hover:block">
                <div class="py-1">
                    <button onclick="langLoader.setLang('en')" class="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">🇬🇧 English</button>
                    <button onclick="langLoader.setLang('ur')" class="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">🇵🇰 Urdu</button>
                    <button onclick="langLoader.setLang('ar')" class="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">🇸🇦 Arabic</button>
                </div>
            </div>
        `;
        // Insert before mobile menu button
        const mobileBtn = document.querySelector('nav button.md\\:hidden');
        if (mobileBtn) {
            mobileBtn.parentNode.insertBefore(container, mobileBtn);
        } else {
            document.querySelector('nav .max-w-7xl').appendChild(container); // Fallback
        }
    }

    setLang(lang) {
        this.currentLang = lang;
        document.getElementById('currentLangLabel').textContent = lang.toUpperCase();

        // Demo effect - In real app, this would replace text nodes
        if (lang !== 'en') {
            alert(`Switched to ${lang.toUpperCase()} (Demo: Translation logic would replace text here)`);
        }
    }
}

window.langLoader = new LangLoader();
