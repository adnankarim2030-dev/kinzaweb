const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'design', 'stitch_kinza_3d_beverage_showcase');
const DEST_DIR = __dirname;

const PAGES = [
    {
        src: 'home_page_kinza/code.html',
        dest: 'index.html',
        name: 'Home',
        file: 'index.html'
    },
    {
        src: 'about_us_kinza/code.html',
        dest: 'about.html',
        name: 'About Us',
        file: 'about.html'
    },
    {
        src: 'products_flavors_kinza_full_range/code.html',
        dest: 'products.html',
        name: 'Flavors',
        file: 'products.html'
    },
    {
        src: 'gallery_where_to_buy_kinza/code.html',
        dest: 'gallery.html',
        name: 'Gallery',
        file: 'gallery.html'
    },
    {
        src: 'contact_us_kinza/code.html',
        dest: 'contact.html',
        name: 'Contact',
        file: 'contact.html'
    }
];

function patchLinks(htmlContent, currentPage) {
    let patched = htmlContent;

    // 1. Fix Desktop Navigation Links (Home, About Us, Flavors, Gallery, Contact)
    const replacements = [
        { label: 'Home', file: 'index.html' },
        { label: 'About Us', file: 'about.html' },
        { label: 'Flavors', file: 'products.html' },
        { label: 'Gallery', file: 'gallery.html' },
        { label: 'Contact', file: 'contact.html' }
    ];

    replacements.forEach(({ label, file }) => {
        const regex = new RegExp(`(<a[^>]*href=")#"([^>]*>${label}</a>)`, 'g');
        patched = patched.replace(regex, `$1${file}"$2`);
        
        const regexSingle = new RegExp(`(<a[^>]*href=')#'([^>]*>${label}</a>)`, 'g');
        patched = patched.replace(regexSingle, `$1${file}'$2`);
    });

    // 2. Fix the active styling class in the nav bar
    replacements.forEach(({ label, file }) => {
        const isCurrent = file === currentPage;
        const tagRegex = new RegExp(`(<a[^>]*href="${file}"[^>]*class=")([^"]*)("[^>]*>${label}</a>)`, 'g');
        
        patched = patched.replace(tagRegex, (match, before, classes, after) => {
            let updatedClasses = classes
                .replace(/border-b-2|border-orange-burst|font-bold|text-primary/g, '')
                .trim();
            
            if (isCurrent) {
                updatedClasses += ' text-primary border-b-2 border-orange-burst font-bold pb-1';
            } else {
                updatedClasses += ' text-on-surface-variant hover:text-primary';
            }
            
            updatedClasses = updatedClasses.replace(/\s+/g, ' ');
            return `${before}${updatedClasses}${after}`;
        });
    });

    // 3. Make desktop "Where to Buy" hide on mobile screens (class 'hidden md:block')
    // We replace the Where to Buy button inside the <nav> element
    patched = patched.replace(
        /<button([^>]*class=")([^"]*)("[^>]*>\s*Where to Buy\s*<\/button>)/,
        (match, before, classes, after) => {
            let updatedClasses = classes.replace(/hidden|md:block/g, '').trim();
            updatedClasses = `hidden md:block ${updatedClasses}`.replace(/\s+/g, ' ');
            return `<button onclick="window.location.href='gallery.html'" ${before}${updatedClasses}${after}`;
        }
    );

    // 4. Inject mobile menu hamburger button inside the <nav> element, right after the desktop "Where to Buy" button
    const navEndRegex = /(<\/button>)\s*(<\/nav>)/;
    if (navEndRegex.test(patched)) {
        const hamburgerBtnHtml = `
        $1
        <!-- Mobile Menu Toggle Button -->
        <button id="mobile-menu-btn" class="md:hidden text-primary focus:outline-none flex items-center justify-center p-2 rounded-full hover:bg-primary/10 transition-colors z-50">
            <span class="material-symbols-outlined text-[28px] !leading-none" id="menu-icon" style="font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;">menu</span>
        </button>
        $2`;
        patched = patched.replace(navEndRegex, hamburgerBtnHtml);
    }

    // 5. Inject the Mobile Menu Overlay right after the </nav> element
    const navCloseRegex = /(<\/nav>)/;
    if (navCloseRegex.test(patched)) {
        // Build links list with active classes highlighted
        const mobileLinksHtml = replacements.map(({ label, file }) => {
            const isCurrent = file === currentPage;
            const activeClass = isCurrent 
                ? 'text-primary font-bold border-l-4 border-orange-burst pl-3' 
                : 'text-on-surface-variant hover:text-primary hover:pl-2';
            return `<a class="font-label-lg text-lg py-2.5 border-b border-surface-variant/10 transition-all duration-300 ${activeClass}" href="${file}">${label}</a>`;
        }).join('\n');

        const mobileMenuOverlayHtml = `
        $1
        <!-- Mobile Menu Overlay -->
        <div id="mobile-menu" class="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] bg-pure-white/95 dark:bg-black/95 backdrop-blur-2xl rounded-2xl border border-pure-white/20 p-6 z-40 shadow-2xl transition-all duration-300 opacity-0 pointer-events-none -translate-y-4 md:hidden">
            <div class="flex flex-col gap-3">
                ${mobileLinksHtml}
                <button onclick="window.location.href='gallery.html'" class="w-full bg-primary text-pure-white py-3 rounded-full font-label-lg mt-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Where to Buy
                </button>
            </div>
        </div>`;
        patched = patched.replace(navCloseRegex, mobileMenuOverlayHtml);
    }

    // 6. Fix other buttons
    patched = patched.replace(
        /<button([^>]*>)\s*Explore Flavors\s*(<span[^>]*>arrow_forward<\/span>)?\s*<\/button>/g,
        '<button onclick="window.location.href=\'products.html\'"$1Explore Flavors$2</button>'
    );
    patched = patched.replace(
        /<button([^>]*>)\s*Explore Our Flavors\s*(<span[^>]*>arrow_forward<\/span>)?\s*<\/button>/g,
        '<button onclick="window.location.href=\'products.html\'"$1Explore Our Flavors$2</button>'
    );

    // 7. Inject Mobile Menu Toggle JS logic right before </body>
    const bodyCloseRegex = /(<\/body>)/;
    if (bodyCloseRegex.test(patched)) {
        const toggleScriptHtml = `
        <!-- Mobile Menu Script -->
        <script>
        document.addEventListener('DOMContentLoaded', () => {
            const menuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            const menuIcon = document.getElementById('menu-icon');
            
            if (menuBtn && mobileMenu) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isClosed = mobileMenu.classList.contains('opacity-0');
                    if (isClosed) {
                        // Open Menu
                        mobileMenu.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
                        mobileMenu.classList.add('opacity-100', 'translate-y-0');
                        if (menuIcon) {
                            menuIcon.textContent = 'close';
                            menuIcon.style.color = '#F39200'; // accent highlight on open
                        }
                    } else {
                        // Close Menu
                        closeMenu();
                    }
                });

                // Helper to close menu
                const closeMenu = () => {
                    mobileMenu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
                    mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                    if (menuIcon) {
                        menuIcon.textContent = 'menu';
                        menuIcon.style.color = '';
                    }
                };

                // Close menu if clicking outside
                document.addEventListener('click', (e) => {
                    if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                        closeMenu();
                    }
                });

                // Close menu on window resize if crossing md breakpoint
                window.addEventListener('resize', () => {
                    if (window.innerWidth >= 768) {
                        closeMenu();
                    }
                });
            }
        });
        </script>
        $1`;
        patched = patched.replace(bodyCloseRegex, toggleScriptHtml);
    }

    return patched;
}

function runMigration() {
    console.log('Starting migration...');
    
    PAGES.forEach(({ src, dest, name }) => {
        const srcPath = path.join(SOURCE_DIR, src);
        const destPath = path.join(DEST_DIR, dest);
        
        if (!fs.existsSync(srcPath)) {
            console.error(`Source file not found: ${srcPath}`);
            return;
        }
        
        console.log(`Processing ${name} page...`);
        let html = fs.readFileSync(srcPath, 'utf-8');
        
        // Patch the navigation and action links
        html = patchLinks(html, dest);
        
        // Write patched content to root folder
        fs.writeFileSync(destPath, html, 'utf-8');
        console.log(`Saved ${dest}`);
    });
    
    console.log('HTML pages compiled with mobile menus.');
    
    // Run image mapper
    mapDownloadedImages();
}

function mapDownloadedImages() {
    console.log('Mapping local images...');
    const urlMap = new Map();
    
    // Re-collect remote links from original designs to map them to saved names
    let imgCounter = 1;
    PAGES.forEach(({ src }) => {
        const srcPath = path.join(SOURCE_DIR, src);
        if (!fs.existsSync(srcPath)) return;
        
        const content = fs.readFileSync(srcPath, 'utf-8');
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            const url = match[1];
            if (url.startsWith('http') && !urlMap.has(url)) {
                const ext = url.includes('image/jpeg') || url.includes('AP1WRLvw') ? 'jpg' : 'png';
                urlMap.set(url, `images/img_${imgCounter++}.${ext}`);
            }
        }
    });

    // Update all newly written pages in DEST_DIR to use these local paths
    PAGES.forEach(({ dest }) => {
        const destPath = path.join(DEST_DIR, dest);
        if (!fs.existsSync(destPath)) return;
        
        let content = fs.readFileSync(destPath, 'utf-8');
        let replaceCount = 0;
        
        urlMap.forEach((localPath, remoteUrl) => {
            const escapedUrl = remoteUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedUrl, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, localPath);
                replaceCount++;
            }
        });
        
        fs.writeFileSync(destPath, content, 'utf-8');
        console.log(`Saved ${dest} with ${replaceCount} local images.`);
    });
    
    console.log('Migration completed successfully!');
}

runMigration();
