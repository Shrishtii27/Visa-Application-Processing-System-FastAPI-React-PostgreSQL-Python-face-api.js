export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Visa - Application Processing System.</p>
        <p>Secure · Encrypted · Compliant</p>
      </div>
    </footer>
  );
}

export default Footer;
