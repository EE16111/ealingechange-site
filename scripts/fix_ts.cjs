const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    
    if (original !== content) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${filePath}`);
    }
}

const errReplacements = [
    ['catch (err: any)', 'catch (err: unknown)'],
    ['err.message', '(err instanceof Error ? err.message : String(err))']
];

replaceInFile('src/components/AdminLoginModal.tsx', errReplacements);
replaceInFile('src/components/admin/CustomersTab.tsx', errReplacements);
replaceInFile('src/components/admin/DashboardTab.tsx', errReplacements);
replaceInFile('src/components/admin/FulfillmentTab.tsx', errReplacements);
replaceInFile('src/components/admin/RatesTab.tsx', errReplacements);
replaceInFile('src/components/admin/SettingsTab.tsx', errReplacements);
replaceInFile('src/components/pages/ContactPage.tsx', errReplacements);
replaceInFile('src/services/exchangeService.ts', errReplacements);

// Specific fixes
replaceInFile('src/components/Footer.tsx', [
    ['(e: any) =>', '(e: React.ChangeEvent<HTMLInputElement>) =>']
]);

replaceInFile('src/components/LiveRatesTable.tsx', [
    ['(currency: any)', '(currency: Currency)']
]);

replaceInFile('src/components/pages/ContactPage.tsx', [
    ['(e: any) =>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>']
]);
