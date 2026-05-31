export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70">
      <div className="flex flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:px-10 lg:px-16">
        <p>© {new Date().getFullYear()} Visa - Application Processing System.</p>
        <p>Secure · Encrypted · Compliant</p>
      </div>
    </footer>
  );
}

export default Footer;
