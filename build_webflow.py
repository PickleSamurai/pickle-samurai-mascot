"""Builds the Webflow-ready fragments (Code Embed bodies) + CSS into the CDN repo's site/ folder.
Run from this folder: python build_webflow.py <path-to-repo-site-dir>"""
import re, sys, pathlib, html

ROOT = pathlib.Path(__file__).parent
OUT = pathlib.Path(sys.argv[1]); (OUT / "pages").mkdir(parents=True, exist_ok=True)
EMAIL = "support@picklesamurai.com"
BOOK = ("https://calendar.google.com/calendar/appointments/schedules/"
        "AcZssZ04zb_XMrqEWHHy236uobBIjQZjtXZEzW-iknCMImnTSsfS3PUrZDcU09yu_R_eMaGFGNuKMVWW")
UPDATED = "September 28, 2026"

# ---- CSS for document pages (fonts inlined, @import removed)
site_css = (ROOT / "assets/site.css").read_text(encoding="utf-8").replace("@import url('fonts.css');", "")
(OUT / "doc-v1.css").write_text((ROOT / "assets/fonts.css").read_text(encoding="utf-8") + "\n" + site_css, encoding="utf-8")

NAV = f'''<a class="skip" href="#main">Skip to main content</a>
<nav aria-label="Main">
  <a class="logo" href="/" aria-label="Pickle Samurai home">PICKLE<b>SAMURAI</b></a>
  <ul>
    <li><a href="/#design">Design</a></li>
    <li><a href="/#security">Security</a></li>
    <li><a href="/#web3">Web3</a></li>
    <li><a href="/#work">Work</a></li>
    <li><a href="/#contact">Contact</a></li>
  </ul>
  <a class="btn" href="{BOOK}" target="_blank" rel="noopener noreferrer"><span class="full">Book a consultation</span><span class="short">Book a call</span></a>
</nav>'''

FOOT = f'''<footer>
  <span>&copy; 2026 Pickle Samurai LLC</span>
  <nav class="legal" aria-label="Legal">
    <a href="/about">About</a><a href="/security">Security</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a>
    <a href="mailto:{EMAIL}">{EMAIL}</a>
  </nav>
</footer>'''


def wrap(main_inner):
    return NAV + f'\n<main id="main" class="doc" tabindex="-1">\n{main_inner.strip()}\n</main>\n' + FOOT + "\n"


def existing_main(name):
    t = (ROOT / name).read_text(encoding="utf-8")
    return re.search(r'<main[^>]*>(.*?)</main>', t, re.S).group(1)


pages = {}

# ---- PRIVACY (add hosting provider, fix font sentence)
p = existing_main("privacy.html")
p = p.replace(
    "<tr><td>jsDelivr (content delivery network)</td><td>Animation and 3D code libraries, and the 3D mascot model file (stored in our public GitHub repository and delivered through jsDelivr)</td></tr>",
    "<tr><td>Webflow (website hosting)</td><td>Delivers this website's pages and records standard server logs, under Webflow's privacy policy</td></tr>\n"
    "<tr><td>jsDelivr (content delivery network)</td><td>Animation and 3D code libraries, this site's style and script files and fonts, and the 3D mascot model file (stored in our public GitHub repository and delivered through jsDelivr)</td></tr>")
p = p.replace("Fonts are served from our own site.", "Fonts are self-hosted files (we do not use Google Fonts) and are delivered through the same content delivery network.")
assert "Webflow (website hosting)" in p and "self-hosted files" in p
pages["privacy"] = p

# ---- TERMS (remove unconfirmed governing-law placeholder; never publish a TODO)
t = existing_main("terms.html")
t2 = re.sub(r'<h2>Governing law</h2>\s*<p>.*?</p>\s*', '', t, flags=re.S)
assert "todo" not in t2 and "Governing law" not in t2
pages["terms"] = t2

# ---- ACCESSIBILITY
pages["accessibility"] = existing_main("accessibility.html")

# ---- ABOUT
pages["about"] = f'''
<p class="kicker">About</p>
<h1>About Pickle Samurai</h1>
<p class="meta">Last updated: {UPDATED}</p>
<p>Pickle Samurai LLC is a small studio that designs fast, accessible websites, reviews website security basics, and explains web3 risks in plain English.</p>

<h2>Our mission</h2>
<p>Help small businesses, creators, and people new to web3 build a clear, safe presence online, and keep the safety knowledge free to learn.</p>

<h2>Who we serve</h2>
<ul>
<li>Local owner-operators, such as food trucks, barbers, trades, and studios, who need a site that takes bookings or orders.</li>
<li>Independent creators and small teams who want their site to look established and load fast.</li>
<li>People new to web3 who want to understand wallet, link, and approval risks before they connect or sign anything.</li>
</ul>

<h2>What we do</h2>
<ul>
<li><strong>Web design and development.</strong> Mobile-first sites built in Webflow, with motion that respects visitors who prefer less of it.</li>
<li><strong>Website security baseline review.</strong> A written, prioritized review of the basics. It is not a penetration test or a certification.</li>
<li><strong>Web3 read-only integrations.</strong> Quote only. We do not take custody of funds, keys, or seed phrases.</li>
<li><strong>Free education.</strong> Videos on our <a href="https://www.youtube.com/@PickleSamuraiAI" target="_blank" rel="noopener noreferrer">YouTube channel</a> and a free 15-minute consultation.</li>
</ul>

<h2>How we work</h2>
<ul>
<li><strong>Plain language.</strong> We explain choices and risks without jargon.</li>
<li><strong>Privacy by design.</strong> We collect as little as we can. See the <a href="/privacy">Privacy Policy</a>.</li>
<li><strong>Accessibility.</strong> We build toward WCAG 2.2 AA and say where we fall short. See the <a href="/accessibility">Accessibility Statement</a>.</li>
<li><strong>No guarantees.</strong> We do not promise rankings, traffic, revenue, or that anything can never be attacked.</li>
<li><strong>Honest portfolio.</strong> Concept projects are labeled as fictional. We show real client work only with the client's written permission.</li>
</ul>

<h2>Where we are today</h2>
<p>We are an early-stage studio. Our portfolio today is this site and clearly labeled concept projects. As real projects are completed, we will share outcomes only with permission and only figures we can support.</p>

<h2>Organization facts</h2>
<div class="tablewrap"><table>
<tbody>
<tr><th scope="row">Legal name</th><td>Pickle Samurai LLC</td></tr>
<tr><th scope="row">Entity type</th><td>Limited liability company</td></tr>
<tr><th scope="row">Founder and lead</th><td>Angel Estrada</td></tr>
<tr><th scope="row">Focus</th><td>Web design, website security review, web3 safety education</td></tr>
<tr><th scope="row">Website</th><td>www.picklesamurai.com</td></tr>
<tr><th scope="row">Contact</th><td><a href="mailto:{EMAIL}">{EMAIL}</a></td></tr>
<tr><th scope="row">Free consultation</th><td>15 minutes on Google Meet, weekdays 9 a.m. to 5 p.m. Pacific</td></tr>
<tr><th scope="row">Public channels</th><td><a href="https://www.youtube.com/@PickleSamuraiAI" target="_blank" rel="noopener noreferrer">YouTube</a>, <a href="https://www.tiktok.com/@picklesamuraitoken" target="_blank" rel="noopener noreferrer">TikTok</a>, <a href="https://x.com/PickleSamurai1" target="_blank" rel="noopener noreferrer">X</a></td></tr>
</tbody></table></div>
<p class="actions"><a class="btn" href="{BOOK}" target="_blank" rel="noopener noreferrer">Book a free consultation</a></p>
'''

# ---- SECURITY
pages["security"] = f'''
<p class="kicker">Security</p>
<h1>Security &amp; Reporting</h1>
<p class="meta">Last updated: {UPDATED}</p>
<p>How this site is built, how to report a problem with it, and how to stay safe around web3.</p>

<h2>Report a vulnerability</h2>
<p>If you think you found a security problem with this site, email <a href="mailto:{EMAIL}">{EMAIL}</a>. Please include the page, the steps to reproduce it, and what you saw. To keep everyone safe, please:</p>
<ul>
<li>Do not access, change, or delete data that is not yours.</li>
<li>Do not disrupt the site or run automated attacks at scale.</li>
<li>Give us reasonable time to fix the problem before you share it publicly.</li>
</ul>
<p>We read every report. We do not run a paid bug bounty program.</p>

<h2>How this site is built</h2>
<ul>
<li>Delivered over HTTPS by Webflow hosting.</li>
<li>No user accounts and no logins. Bookings happen on Google Calendar's scheduling page, not on this site.</li>
<li>No cookies of our own, and no analytics or advertising trackers.</li>
<li>Fonts are self-hosted. Code and files come from a public content delivery network, listed in the <a href="/privacy">Privacy Policy</a>.</li>
</ul>

<h2>Staying safe with web3</h2>
<div class="callout"><strong>We will never ask for your seed phrase, private key, recovery phrase, wallet or exchange password, two-factor codes, or full payment-card details.</strong> Anyone who does is not us.</div>
<ul>
<li>Slow down when a message creates urgency. Scammers rely on it.</li>
<li>Check a link's real address before you connect a wallet or approve anything.</li>
<li>Be suspicious of unexpected direct messages, even from accounts that look familiar.</li>
</ul>
<p>This is general education, not financial, investment, or legal advice, and nothing can guarantee that a wallet, link, or transaction is safe.</p>

<h2>What we are not</h2>
<p>We are not currently certified under any security standard (for example SOC 2 or ISO 27001), and our security reviews are not penetration tests.</p>
'''

pages["notfound"] = """
<p class="kicker">Error 404</p>
<h1>That path leads nowhere</h1>
<p>The page you are looking for doesn't exist or has moved. Head back and pick a new route.</p>
<p class="actions"><a class="btn" href="/">Back to home</a></p>
"""

for name, main in pages.items():
    frag = wrap(main)
    (OUT / "pages" / f"{name}.html").write_text(frag, encoding="utf-8")
    print(f"{name}: {len(frag)} chars")

# ---- HOME body (v2: footer with About + Security)
src = (ROOT / "index.html").read_text(encoding="utf-8")
body = src.split("<body>", 1)[1].split("<script", 1)[0].strip()
body = body.replace('href="privacy.html"', 'href="/privacy"').replace('href="terms.html"', 'href="/terms"').replace('href="accessibility.html"', 'href="/accessibility"')
body = re.sub(r'href="concepts/[a-z-]*/index.html"', 'href="#work"', body)
body = body.replace('<a href="/privacy">Privacy</a>', '<a href="/about">About</a><a href="/security">Security</a><a href="/privacy">Privacy</a>')
body = body.replace("&copy; Pickle Samurai LLC", "&copy; 2026 Pickle Samurai LLC")
assert '/about' in body and '2026 Pickle' in body
(OUT / "body-v2.html").write_text(body, encoding="utf-8")
print("home body:", len(body))
